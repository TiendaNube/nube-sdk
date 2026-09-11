import type { NubeSDKApp } from "@/background/types";
import { Badge } from "@/components/ui/badge";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Table, TableBody, TableRow } from "@/components/ui/table";
import type { NubeSDKEvent } from "@/contexts/nube-sdk-apps-context";
import { useNubeSDKAppsContext } from "@/contexts/nube-sdk-apps-context";
import { EmptyState } from "@/devtools/components/empty-state";
import Layout from "@/devtools/components/layout";
import { getPageSessionStorage } from "@/utils";
import { Circle, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	AppDetailPanel,
	type ScriptStatus,
	getScriptStatusColor,
	getScriptStatusLabel,
} from "../components/app-detail-panel";
import { TableRowItem } from "../components/table-row-item";

const STORAGE_KEY = "nube-devtools-apps-panel-size";
const PAGE_STORAGE_KEY_DEVTOOLS_APPLICATION =
	"nube-devtools-application-server";
const MIN_REFRESH_FEEDBACK_MS = 500;

type LocalModeStoredData = {
	appId?: string;
	type?: "new" | "existing";
	connected?: boolean;
};

const getApps = (): Record<string, NubeSDKApp> => {
	if (window.nubeSDK) {
		return window.nubeSDK.getState().apps;
	}
	return {};
};

export function Apps() {
	const { apps, setApps } = useNubeSDKAppsContext();
	const [selectedApp, setSelectedApp] = useState<NubeSDKEvent | null>(null);
	const [localModeData, setLocalModeData] =
		useState<LocalModeStoredData | null>(null);

	const [isRefreshing, setIsRefreshing] = useState(false);
	const retryTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
	const refreshTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

	const fetchApps = useCallback(() => {
		if (retryTimeout.current) {
			clearTimeout(retryTimeout.current);
			retryTimeout.current = null;
		}
		return new Promise<void>((resolve) => {
			chrome.scripting.executeScript(
				{
					target: { tabId: chrome.devtools.inspectedWindow.tabId },
					world: "MAIN",
					func: getApps,
				},
				(results) => {
					try {
						const appsResult = results?.[0]?.result as
							| Record<string, NubeSDKApp>
							| undefined;
						const appsKeys = appsResult ? Object.keys(appsResult) : [];

						if (appsKeys.length > 0 && appsResult) {
							const apps = Object.keys(appsResult).map((key) => {
								return {
									id: crypto.randomUUID(),
									data: appsResult[key],
								};
							});
							setApps(apps);
						} else {
							setApps([]);
							retryTimeout.current = setTimeout(fetchApps, 2000);
						}
					} catch (error) {
						setApps([]);
					} finally {
						resolve();
					}
				},
			);
		});
	}, [setApps]);

	const handleRefresh = useCallback(async () => {
		setIsRefreshing(true);
		await Promise.all([
			fetchApps(),
			new Promise<void>((resolve) => {
				refreshTimeout.current = setTimeout(resolve, MIN_REFRESH_FEEDBACK_MS);
			}),
		]);
		setIsRefreshing(false);
	}, [fetchApps]);

	useEffect(() => {
		fetchApps();
		return () => {
			if (retryTimeout.current) {
				clearTimeout(retryTimeout.current);
				retryTimeout.current = null;
			}
			if (refreshTimeout.current) {
				clearTimeout(refreshTimeout.current);
				refreshTimeout.current = null;
			}
		};
	}, [fetchApps]);

	useEffect(() => {
		let cancelled = false;
		getPageSessionStorage(PAGE_STORAGE_KEY_DEVTOOLS_APPLICATION).then(
			(stored) => {
				if (cancelled || !stored) {
					if (!cancelled) setLocalModeData(null);
					return;
				}
				try {
					const data = JSON.parse(stored) as LocalModeStoredData;
					if (data.connected === true && data.appId && data.type) {
						setLocalModeData({ appId: data.appId, type: data.type });
					} else {
						setLocalModeData(null);
					}
				} catch {
					setLocalModeData(null);
				}
			},
		);
		return () => {
			cancelled = true;
		};
	}, []);

	const handleOnSelect = (event: NubeSDKEvent) => {
		setSelectedApp(event);
	};

	const [scriptStatuses, setScriptStatuses] = useState<
		Record<string, ScriptStatus>
	>({});
	const checkedScripts = useRef<Set<string>>(new Set());

	useEffect(() => {
		for (const app of apps) {
			const scriptUrl = app.data.script;
			if (!scriptUrl || checkedScripts.current.has(scriptUrl)) continue;

			checkedScripts.current.add(scriptUrl);

			setScriptStatuses((prev) => ({
				...prev,
				[scriptUrl]: "checking",
			}));

			fetch(scriptUrl, { method: "HEAD", mode: "no-cors" })
				.then(() => {
					setScriptStatuses((prev) => ({
						...prev,
						[scriptUrl]: "online",
					}));
				})
				.catch(() => {
					setScriptStatuses((prev) => ({
						...prev,
						[scriptUrl]: "offline",
					}));
				});
		}
	}, [apps]);

	const isDevMode = (script: string) => {
		return script.includes("localhost") || script.includes("127.0.0.1");
	};

	const renderScriptStatusRightContent = (
		scriptStatus: ScriptStatus | undefined,
	) => {
		if (!scriptStatus) return null;
		return (
			<Badge
				variant="outline"
				className={`text-[10px] px-1.5 py-0 gap-1 ${getScriptStatusColor(scriptStatus)}`}
			>
				{scriptStatus === "checking" ? (
					<Loader2 className="h-1.5 w-1.5 animate-spin" />
				) : (
					<Circle className="h-1.5 w-1.5 fill-current" />
				)}
				{getScriptStatusLabel(scriptStatus)}
			</Badge>
		);
	};

	return (
		<Layout>
			<div className="flex h-full flex-col">
				<nav className="flex items-center justify-between px-1.5 py-1 border-b h-8.25 shrink-0">
					<div className="flex items-center">
						<SidebarTrigger />
					</div>
					<span className="text-xs">
						{apps.length} {apps.length === 1 ? "app" : "apps"}
					</span>
				</nav>
				<div className="flex-1 overflow-hidden">
					<ResizablePanelGroup
						autoSaveId={STORAGE_KEY}
						storage={localStorage}
						direction="horizontal"
					>
						<ResizablePanel defaultSize={40}>
							{apps.length === 0 ? (
								<EmptyState
									text="No apps found"
									buttonText={isRefreshing ? "Refreshing..." : "Refresh apps"}
									onButtonClick={handleRefresh}
									isLoading={isRefreshing}
								/>
							) : (
								<div className="overflow-hidden w-full">
									<Table className="table-fixed">
										<TableBody className="[&_tr:last-child]:border-b">
											{apps.map((app) => {
												const isLocalModeApp =
													localModeData?.appId === app.data.id;
												const localModeBadge1 = isLocalModeApp
													? "Local Mode"
													: undefined;
												const localModeBadge2 =
													isLocalModeApp && localModeData?.type === "existing"
														? "Replaced Script"
														: undefined;

												return (
													<TableRow key={app.id}>
														<TableRowItem
															isSelected={app.id === selectedApp?.id}
															title={app.data.id}
															badge1={
																localModeBadge1 ??
																(isDevMode(app.data.script)
																	? "dev mode"
																	: undefined)
															}
															badge2={localModeBadge2}
															event={app}
															onSelect={handleOnSelect}
															rightContent={renderScriptStatusRightContent(
																scriptStatuses[app.data.script],
															)}
														/>
													</TableRow>
												);
											})}
										</TableBody>
									</Table>
								</div>
							)}
						</ResizablePanel>
						<ResizableHandle />
						<ResizablePanel>
							{selectedApp && (
								<AppDetailPanel
									id={selectedApp.data.id}
									registered={selectedApp.data.registered}
									script={selectedApp.data.script}
									scriptStatus={scriptStatuses[selectedApp.data.script]}
								/>
							)}
						</ResizablePanel>
					</ResizablePanelGroup>
				</div>
			</div>
		</Layout>
	);
}
