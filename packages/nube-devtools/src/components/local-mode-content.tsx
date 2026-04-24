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
import { Globe, Hash, Loader2, Play, Square } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const LOCAL_STORAGE_KEY_DEVTOOLS_LOCAL_MODE_SELECTED_TAB =
	"nube-devtools-local-mode-selected-tab";
const LOCAL_STORAGE_KEY_DEVTOOLS_APP_SERVER_URL =
	"nube-devtools-app-server-url";
const PAGE_STORAGE_KEY_DEVTOOLS_APPLICATION =
	"nube-devtools-application-server";
const MAX_POLL_ATTEMPTS = 10;
const POLL_INTERVAL_MS = 2000;

type StoredApplicationServerData = {
	script?: string;
	connected?: boolean;
	appId?: string;
	type?: "new" | "existing";
};

async function fetchScriptAvailable(url: string): Promise<boolean> {
	try {
		const response = await fetch(url, { method: "GET", mode: "cors" });
		return response.status === 200;
	} catch {
		return false;
	}
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

export function LocalModeContent() {
	const [apps, setApps] = useState<NubeSDKApp[]>([]);
	const [selectedTab, setSelectedTab] = useState<"new" | "existing">(
		(localStorage.getItem(LOCAL_STORAGE_KEY_DEVTOOLS_LOCAL_MODE_SELECTED_TAB) as
			| "new"
			| "existing") || "new",
	);
	const [existingAppId, setExistingAppId] = useState("");
	const [appId, setAppId] = useState("");
	const [appUrl, setAppUrl] = useState(
		localStorage.getItem(LOCAL_STORAGE_KEY_DEVTOOLS_APP_SERVER_URL) || "",
	);
	const [isConnecting, setIsConnecting] = useState(false);
	const [scriptAvailability, setScriptAvailability] =
		useState<ScriptAvailability>(null);
	const [status, setStatus] = useState<"idle" | "connecting" | "connected">(
		"idle",
	);
	const pollCancelledRef = useRef(false);
	const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const checkScriptAvailabilityOnce = useCallback(async (url: string) => {
		setScriptAvailability("checking");
		try {
			const available = await fetchScriptAvailable(url);
			setScriptAvailability(available ? "available" : "unavailable");
		} catch {
			setScriptAvailability("unavailable");
		}
	}, []);

	const executeAppsScript = useCallback((tabId: number) => {
		chrome.scripting.executeScript(
			{
				target: { tabId },
				world: "MAIN",
				func: getApps,
			},
			(results) => {
				const appsRecord = results?.[0]?.result;
				if (appsRecord && typeof appsRecord === "object") {
					setApps(Object.values(appsRecord as Record<string, NubeSDKApp>));
				}
			},
		);
	}, []);

	const fetchApps = useCallback(() => {
		if (chrome.devtools?.inspectedWindow?.tabId != null) {
			executeAppsScript(chrome.devtools.inspectedWindow.tabId);
			return;
		}
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			const tabId = tabs[0]?.id;
			if (tabId != null) {
				executeAppsScript(tabId);
			}
		});
	}, [executeAppsScript]);

	const checkScriptAvailability = async (url: string) => {
		pollCancelledRef.current = false;
		setScriptAvailability("checking");

		const runAttempt = async (attempt: number): Promise<void> => {
			if (pollCancelledRef.current) return;

			const available = await fetchScriptAvailable(url);
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

	const handleUrlChange = (value: string) => {
		setAppUrl(value);
		setScriptAvailability(null);
		cancelPolling();
	};

	useEffect(() => {
		if (selectedTab === "existing") {
			fetchApps();
		}
	}, [selectedTab, fetchApps]);

	useEffect(() => {
		return () => cancelPolling();
	}, [cancelPolling]);

	useEffect(() => {
		const restoreStoredState = (data: StoredApplicationServerData): boolean => {
			const scriptUrl = data.script?.trim();
			if (!scriptUrl) return false;

			setAppUrl(scriptUrl);
			if (data.type) setSelectedTab(data.type);
			if (data.appId) setAppId(data.appId);
			if (data.type === "existing" && data.appId) setExistingAppId(data.appId);

			const connected = data.connected === true;
			setStatus(connected ? "connected" : "idle");

			if (connected && isValidUrl(scriptUrl)) {
				void checkScriptAvailabilityOnce(scriptUrl);
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

	const persistConnectionData = async (data: StoredApplicationServerData) => {
		if (data.script) {
			localStorage.setItem(
				LOCAL_STORAGE_KEY_DEVTOOLS_APP_SERVER_URL,
				data.script,
			);
		}
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
		const trimmedUrl = appUrl.trim();
		if (!trimmedUrl || isConnecting) return;

		const resolvedAppId = resolveAppId();
		if (!resolvedAppId) return;

		setIsConnecting(true);
		setAppId(resolvedAppId);
		setStatus("connecting");

		await persistConnectionData({
			script: trimmedUrl,
			connected: true,
			appId: resolvedAppId,
			type: selectedTab,
		});

		await new Promise((resolve) => setTimeout(resolve, 300));

		setIsConnecting(false);
		setStatus("connected");
		notifyConnectionStatus(true);

		if (isValidUrl(trimmedUrl)) {
			checkScriptAvailability(trimmedUrl);
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
							<div className="space-y-1 mt-4">
								<label
									htmlFor="app-server-url"
									className="text-xs font-medium text-foreground flex items-center gap-1.5"
								>
									<Globe className="w-3.5 h-3.5 text-muted-foreground" />
									Script URL
								</label>
								<Input
									id="app-server-url"
									type="url"
									placeholder="http://localhost:8081/main.min.js"
									value={appUrl}
									onChange={(e) => handleUrlChange(e.target.value)}
									className="bg-input border-border text-foreground placeholder:text-muted-foreground h-9 font-mono text-xs"
									disabled={isConnecting || status === "connected"}
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
								<div className="space-y-1">
									<label
										htmlFor="app-server-url"
										className="text-xs font-medium text-foreground flex items-center gap-1.5"
									>
										<Globe className="w-3.5 h-3.5 text-muted-foreground" />
										Script URL
									</label>
									<Input
										id="app-server-url"
										type="url"
										placeholder="http://localhost:8081/main.min.js"
										value={appUrl}
										onChange={(e) => handleUrlChange(e.target.value)}
										className="bg-input border-border text-foreground placeholder:text-muted-foreground h-9 font-mono text-xs"
										disabled={isConnecting || status === "connected"}
									/>
								</div>
							</div>
						</TabsContent>
					</Tabs>

					<LocalModeStatusMessages
						status={status}
						scriptAvailability={scriptAvailability}
						appId={appId}
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
								!appUrl.trim() ||
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
						App must be running at the URL above.
					</p>
				</CardContent>
			</Card>

			<LocalModeQuickTips />
		</div>
	);
}
