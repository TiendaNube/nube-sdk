import type { NubeSDKApp } from "@/background/types";
import { LocalModeCardHeader } from "@/components/local-mode-card-header";
import { LocalModeQuickTips } from "@/components/local-mode-quick-tips";
import {
	LocalModeStatusMessages,
	type ScriptAvailability,
} from "@/components/local-mode-status-messages";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	NativeSelect,
	NativeSelectOption,
} from "@/components/ui/native-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPageSessionStorage, setPageSessionStorage } from "@/utils";
import {
	type StoredApplicationServerData,
	buildApplicationServerData,
	getLocalModeEntryIds,
	readScriptUrls,
	resolveScriptUrls,
} from "@/utils/local-mode-scripts";
import { Globe, Hash, Loader2, Play, Plus, Square, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const LOCAL_STORAGE_KEY_DEVTOOLS_LOCAL_MODE_SELECTED_TAB =
	"nube-devtools-local-mode-selected-tab";
const LOCAL_STORAGE_KEY_DEVTOOLS_APP_SERVER_URL =
	"nube-devtools-app-server-url";
const LOCAL_STORAGE_KEY_DEVTOOLS_APP_SERVER_URLS =
	"nube-devtools-app-server-urls";
const PAGE_STORAGE_KEY_DEVTOOLS_APPLICATION =
	"nube-devtools-application-server";
const MAX_POLL_ATTEMPTS = 10;
const POLL_INTERVAL_MS = 2000;
const MAX_APPS_FETCH_ATTEMPTS = 5;
const DEFAULT_APP_URL = "http://localhost:8080/main.min.js";

async function fetchScriptAvailable(url: string): Promise<boolean> {
	try {
		const response = await fetch(url, { method: "GET", mode: "cors" });
		return response.status === 200;
	} catch {
		return false;
	}
}

/** Every script must be served for the app to run as it would on the host. */
async function fetchScriptsAvailable(urls: string[]): Promise<boolean> {
	const results = await Promise.all(urls.map(fetchScriptAvailable));
	return results.every(Boolean);
}

/** The URLs typed last time, so the fields come back after the panel closes. */
function loadStoredUrls(): string[] {
	try {
		const raw = localStorage.getItem(
			LOCAL_STORAGE_KEY_DEVTOOLS_APP_SERVER_URLS,
		);
		const urls: unknown = raw ? JSON.parse(raw) : null;
		if (
			Array.isArray(urls) &&
			urls.length > 0 &&
			urls.every((url) => typeof url === "string")
		) {
			return urls;
		}
	} catch {
		// Falls back to the single URL kept by older versions.
	}
	return [
		localStorage.getItem(LOCAL_STORAGE_KEY_DEVTOOLS_APP_SERVER_URL) || "",
	];
}

function isValidUrl(url: string): boolean {
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
}

function getApps(): Record<string, NubeSDKApp> {
	if (window.nubeSDK) {
		return window.nubeSDK.getState().apps;
	}
	return {};
}

type LocalModeContentProps = {
	/**
	 * Apps registered on the inspected page. The DevTools panel passes the list
	 * it keeps in sync with the runtime; the popup has no such stream, so
	 * without it the page is read directly.
	 */
	apps?: NubeSDKApp[];
};

export function LocalModeContent({ apps: appsProp }: LocalModeContentProps) {
	const [pageApps, setPageApps] = useState<NubeSDKApp[]>([]);
	const apps = appsProp ?? pageApps;
	const shouldFetchApps = appsProp === undefined;
	const [selectedTab, setSelectedTab] = useState<"new" | "existing">(
		(localStorage.getItem(LOCAL_STORAGE_KEY_DEVTOOLS_LOCAL_MODE_SELECTED_TAB) as
			| "new"
			| "existing") || "new",
	);
	const [existingAppId, setExistingAppId] = useState("");
	const [appId, setAppId] = useState("");
	const [appUrls, setAppUrls] = useState<string[]>(loadStoredUrls);
	const [runningScriptCount, setRunningScriptCount] = useState(1);
	const [isConnecting, setIsConnecting] = useState(false);
	const [scriptAvailability, setScriptAvailability] =
		useState<ScriptAvailability>(null);
	const [status, setStatus] = useState<"idle" | "connecting" | "connected">(
		"idle",
	);
	const pollCancelledRef = useRef(false);
	const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const appsRetryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
		null,
	);

	const checkScriptAvailabilityOnce = useCallback(async (urls: string[]) => {
		setScriptAvailability("checking");
		try {
			const available = await fetchScriptsAvailable(urls);
			setScriptAvailability(available ? "available" : "unavailable");
		} catch {
			setScriptAvailability("unavailable");
		}
	}, []);

	const clearAppsRetry = useCallback(() => {
		if (appsRetryTimeoutRef.current) {
			clearTimeout(appsRetryTimeoutRef.current);
			appsRetryTimeoutRef.current = null;
		}
	}, []);

	// Retries while empty: opened during a page load, the runtime may not have
	// registered any app yet.
	const executeAppsScript = useCallback((tabId: number, attempt: number) => {
		chrome.scripting.executeScript(
			{
				target: { tabId },
				world: "MAIN",
				func: getApps,
			},
			(results) => {
				const appsRecord = results?.[0]?.result;
				const next =
					appsRecord && typeof appsRecord === "object"
						? Object.values(appsRecord as Record<string, NubeSDKApp>)
						: [];
				setPageApps(next);

				if (next.length === 0 && attempt < MAX_APPS_FETCH_ATTEMPTS) {
					appsRetryTimeoutRef.current = setTimeout(
						() => executeAppsScript(tabId, attempt + 1),
						POLL_INTERVAL_MS,
					);
				}
			},
		);
	}, []);

	const fetchApps = useCallback(() => {
		if (!shouldFetchApps) return;
		clearAppsRetry();
		if (chrome.devtools?.inspectedWindow?.tabId != null) {
			executeAppsScript(chrome.devtools.inspectedWindow.tabId, 1);
			return;
		}
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			const tabId = tabs[0]?.id;
			if (tabId != null) {
				executeAppsScript(tabId, 1);
			}
		});
	}, [shouldFetchApps, executeAppsScript, clearAppsRetry]);

	const checkScriptAvailability = async (urls: string[]) => {
		pollCancelledRef.current = false;
		setScriptAvailability("checking");

		const runAttempt = async (attempt: number): Promise<void> => {
			if (pollCancelledRef.current) return;

			const available = await fetchScriptsAvailable(urls);
			if (pollCancelledRef.current) return;

			if (available) {
				setScriptAvailability("available");
				await reloadCurrentTab();
				return;
			}

			if (attempt >= MAX_POLL_ATTEMPTS) {
				setScriptAvailability("unavailable");
				return;
			}

			pollTimeoutRef.current = setTimeout(() => {
				pollTimeoutRef.current = null;
				void runAttempt(attempt + 1);
			}, POLL_INTERVAL_MS);
		};

		await runAttempt(1);
	};

	const handleTabChange = (value: "new" | "existing") => {
		localStorage.setItem(
			LOCAL_STORAGE_KEY_DEVTOOLS_LOCAL_MODE_SELECTED_TAB,
			value,
		);
		setSelectedTab(value);
		if (value === "existing") {
			fetchApps();
		}
	};

	const cancelPolling = useCallback(() => {
		pollCancelledRef.current = true;
		if (pollTimeoutRef.current) {
			clearTimeout(pollTimeoutRef.current);
			pollTimeoutRef.current = null;
		}
	}, []);

	const handleUrlChange = (index: number, value: string) => {
		setAppUrls((urls) => urls.map((url, i) => (i === index ? value : url)));
		setScriptAvailability(null);
		cancelPolling();
	};

	const handleAddScript = () => {
		setAppUrls((urls) => [...urls, ""]);
	};

	const handleRemoveScript = (index: number) => {
		setAppUrls((urls) => urls.filter((_, i) => i !== index));
		setScriptAvailability(null);
		cancelPolling();
	};

	useEffect(() => {
		if (selectedTab === "existing") {
			fetchApps();
		}
		return clearAppsRetry;
	}, [selectedTab, fetchApps, clearAppsRetry]);

	useEffect(() => {
		return () => cancelPolling();
	}, [cancelPolling]);

	useEffect(() => {
		const restoreStoredState = (data: StoredApplicationServerData): boolean => {
			const scriptUrls = readScriptUrls(data);
			if (scriptUrls.length === 0) return false;

			setAppUrls(scriptUrls);
			setRunningScriptCount(scriptUrls.length);
			if (data.type) setSelectedTab(data.type);
			if (data.appId) setAppId(data.appId);
			if (data.type === "existing" && data.appId) setExistingAppId(data.appId);

			const connected = data.connected === true;
			setStatus(connected ? "connected" : "idle");

			if (connected && scriptUrls.every(isValidUrl)) {
				void checkScriptAvailabilityOnce(scriptUrls);
			}

			return connected;
		};

		const loadStoredServer = async () => {
			const stored = await getPageSessionStorage(
				PAGE_STORAGE_KEY_DEVTOOLS_APPLICATION,
			);
			if (!stored) {
				notifyConnectionStatus(false);
				return;
			}

			try {
				const data = JSON.parse(stored) as StoredApplicationServerData;
				notifyConnectionStatus(restoreStoredState(data));
			} catch {
				notifyConnectionStatus(false);
			}
		};
		loadStoredServer();
	}, [checkScriptAvailabilityOnce]);

	const reloadCurrentTab = async () => {
		const [tab] = await chrome.tabs.query({
			active: true,
			currentWindow: true,
		});
		if (tab?.id) chrome.tabs.reload(tab.id);
	};

	const notifyConnectionStatus = (connected: boolean) => {
		chrome.runtime.sendMessage({
			action: "nube-devtools-app-server-status",
			payload: { connected },
		});
	};

	const persistConnectionData = async (
		data: StoredApplicationServerData,
		urls: string[],
	) => {
		if (data.script) {
			localStorage.setItem(
				LOCAL_STORAGE_KEY_DEVTOOLS_APP_SERVER_URL,
				data.script,
			);
		}
		localStorage.setItem(
			LOCAL_STORAGE_KEY_DEVTOOLS_APP_SERVER_URLS,
			JSON.stringify(urls),
		);
		await setPageSessionStorage(
			PAGE_STORAGE_KEY_DEVTOOLS_APPLICATION,
			JSON.stringify(data),
		);
	};

	const resolveAppId = (): string | null => {
		if (selectedTab === "new") return crypto.randomUUID();
		const id = existingAppId.trim();
		return id || null;
	};

	const handleStart = async () => {
		if (isConnecting) return;

		const resolvedAppId = resolveAppId();
		if (!resolvedAppId) return;

		const scriptUrls = resolveScriptUrls(appUrls, DEFAULT_APP_URL);
		setAppUrls(scriptUrls);
		setRunningScriptCount(scriptUrls.length);

		setIsConnecting(true);
		setAppId(resolvedAppId);
		setStatus("connecting");

		await persistConnectionData(
			buildApplicationServerData({
				urls: scriptUrls,
				appId: resolvedAppId,
				type: selectedTab,
				connected: true,
			}),
			scriptUrls,
		);

		await new Promise((resolve) => setTimeout(resolve, 300));

		setIsConnecting(false);
		setStatus("connected");
		notifyConnectionStatus(true);

		if (scriptUrls.every(isValidUrl)) {
			checkScriptAvailability(scriptUrls);
		} else {
			setScriptAvailability("unavailable");
		}
	};

	const markStoredAsDisconnected = async () => {
		const stored = await getPageSessionStorage(
			PAGE_STORAGE_KEY_DEVTOOLS_APPLICATION,
		);
		if (!stored) return;

		const data = JSON.parse(stored) as StoredApplicationServerData;
		if (!data.connected) return;

		data.connected = false;
		await setPageSessionStorage(
			PAGE_STORAGE_KEY_DEVTOOLS_APPLICATION,
			JSON.stringify(data),
		);
	};

	const handleStop = async () => {
		cancelPolling();
		await markStoredAsDisconnected();

		setAppId("");
		setScriptAvailability(null);
		setStatus("idle");
		notifyConnectionStatus(false);

		await reloadCurrentTab();
	};

	return (
		<div className="w-full max-w-lg">
			<Card className="border-border bg-card">
				<LocalModeCardHeader />
				<CardContent className="space-y-3 px-3 w-full">
					<Tabs
						value={selectedTab}
						onValueChange={(v) => handleTabChange(v as "new" | "existing")}
						className="w-full"
					>
						<TabsList className="w-full">
							<TabsTrigger
								disabled={isConnecting || status === "connected"}
								value="new"
							>
								New App
							</TabsTrigger>
							<TabsTrigger
								disabled={isConnecting || status === "connected"}
								value="existing"
							>
								Existing App
							</TabsTrigger>
						</TabsList>
						<TabsContent value="new">
							<p className="text-xs text-muted-foreground">
								A new app will be installed with a random ID.
							</p>
							<div className="mt-4">
								<ScriptUrlFields
									urls={appUrls}
									disabled={isConnecting || status === "connected"}
									onChange={handleUrlChange}
									onAdd={handleAddScript}
									onRemove={handleRemoveScript}
								/>
							</div>
						</TabsContent>
						<TabsContent value="existing">
							<p className="text-xs text-muted-foreground">
								Select an existing app and provide the script URL to debug it.
							</p>
							<div className="gap-4 flex flex-col mt-4">
								<div className="space-y-1">
									<label
										htmlFor="existing-app-id"
										className="text-xs font-medium text-foreground flex items-center gap-1.5"
									>
										<Hash className="w-4 h-4 text-muted-foreground" />
										App ID
									</label>
									<NativeSelect
										id="existing-app-id"
										value={existingAppId}
										onChange={(e) => setExistingAppId(e.target.value)}
										disabled={isConnecting || status === "connected"}
										className="border-border text-foreground h-9 font-mono text-xs w-full"
									>
										<NativeSelectOption value="" disabled>
											Select an app
										</NativeSelectOption>
										{apps.map((app) => (
											<NativeSelectOption key={app.id} value={app.id}>
												{app.id}
											</NativeSelectOption>
										))}
									</NativeSelect>
								</div>
								<ScriptUrlFields
									urls={appUrls}
									disabled={isConnecting || status === "connected"}
									onChange={handleUrlChange}
									onAdd={handleAddScript}
									onRemove={handleRemoveScript}
								/>
							</div>
						</TabsContent>
					</Tabs>

					<LocalModeStatusMessages
						status={status}
						scriptAvailability={scriptAvailability}
						appId={appId}
						entryIds={
							appId ? getLocalModeEntryIds(appId, runningScriptCount) : []
						}
					/>

					{/* Start/Stop Button */}
					{status === "connected" ? (
						<Button
							onClick={handleStop}
							variant="destructive"
							className="w-full text-xs font-medium cursor-pointer"
							size="sm"
						>
							<Square />
							Stop App
						</Button>
					) : (
						<Button
							onClick={handleStart}
							disabled={
								isConnecting ||
								(selectedTab === "existing" && !existingAppId.trim())
							}
							className="w-full text-xs font-medium cursor-pointer"
							size="sm"
						>
							{isConnecting ? (
								<>
									<Loader2 className="animate-spin" />
									Connecting...
								</>
							) : (
								<>
									<Play />
									Start App
								</>
							)}
						</Button>
					)}

					<p className="text-[11px] text-muted-foreground text-center">
						{appUrls.length > 1
							? "Every script must be running at the URLs above."
							: "App must be running at the URL above."}
					</p>
				</CardContent>
			</Card>

			<LocalModeQuickTips defaultUrl={DEFAULT_APP_URL} />
		</div>
	);
}

type ScriptUrlFieldsProps = {
	urls: string[];
	disabled: boolean;
	onChange: (index: number, value: string) => void;
	onAdd: () => void;
	onRemove: (index: number) => void;
};

/**
 * One URL field per script. A single script runs under the app id; with more
 * than one, every script shares the app id and gets its own script id, as
 * hosts do for an app with several NubeSDK scripts.
 */
function ScriptUrlFields({
	urls,
	disabled,
	onChange,
	onAdd,
	onRemove,
}: ScriptUrlFieldsProps) {
	const multiple = urls.length > 1;

	return (
		<div className="space-y-3">
			{urls.map((url, index) => {
				const id = `app-server-url-${index}`;
				const scriptId = String(index + 1);
				return (
					// biome-ignore lint/suspicious/noArrayIndexKey: fields are positional, the index is the script id
					<div key={index} className="space-y-1">
						<label
							htmlFor={id}
							className="text-xs font-medium text-foreground flex items-center gap-1.5"
						>
							<Globe className="w-3.5 h-3.5 text-muted-foreground" />
							{multiple ? `Script ${scriptId} URL` : "Script URL"}
						</label>
						<div className="flex items-center gap-1.5">
							<Input
								id={id}
								type="url"
								placeholder={index === 0 ? DEFAULT_APP_URL : ""}
								value={url}
								onChange={(e) => onChange(index, e.target.value)}
								className="bg-input border-border text-foreground placeholder:text-muted-foreground h-9 font-mono text-xs"
								disabled={disabled}
							/>
							{multiple && (
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="shrink-0 cursor-pointer"
									onClick={() => onRemove(index)}
									disabled={disabled}
									aria-label={`Remove script ${scriptId}`}
								>
									<X />
								</Button>
							)}
						</div>
					</div>
				);
			})}
			<Button
				type="button"
				variant="outline"
				size="sm"
				className="w-full text-xs cursor-pointer"
				onClick={onAdd}
				disabled={disabled}
			>
				<Plus />
				Add script
			</Button>
			{multiple && (
				<p className="text-[11px] text-muted-foreground">
					The scripts run as one app: same app id, script ids 1 to {urls.length}
					.
				</p>
			)}
		</div>
	);
}
