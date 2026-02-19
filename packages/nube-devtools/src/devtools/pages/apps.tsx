import type { NubeSDKApp } from "@/background/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Table, TableBody, TableRow } from "@/components/ui/table";
import type { NubeSDKEvent } from "@/contexts/nube-sdk-apps-context";
import { useNubeSDKAppsContext } from "@/contexts/nube-sdk-apps-context";
import Layout from "@/devtools/components/layout";
import { Circle, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
	AppDetailPanel,
	type ScriptStatus,
	getScriptStatusColor,
	getScriptStatusLabel,
} from "../components/app-detail-panel";
import { TableRowItem } from "../components/table-row-item";

const STORAGE_KEY = "nube-devtools-apps-panel-size";

const getApps = (): Record<string, NubeSDKApp> => {
	if (window.nubeSDK) {
		return window.nubeSDK.getState().apps;
	}
	return {};
};

export function Apps() {
	const { apps, setApps } = useNubeSDKAppsContext();
	const [selectedApp, setSelectedApp] = useState<NubeSDKEvent | null>(null);

	const fetchApps = useCallback(() => {
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
								id: uuidv4(),
								data: appsResult[key],
							};
						});
						setApps(apps);
					} else {
						setApps([]);
						const timeout = setTimeout(() => {
							fetchApps();
							clearTimeout(timeout);
						}, 2000);
					}
				} catch (error) {
					setApps([]);
				}
			},
		);
	}, [setApps]);

	useEffect(() => {
		fetchApps();
	}, [fetchApps]);

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

	return (
		<Layout>
			<div className="flex h-full flex-col">
				<nav className="flex items-center justify-between px-1.5 py-1 border-b h-[33px] shrink-0">
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
								<div className="flex h-full flex-col items-center justify-center gap-2">
									<p className="text-sm">No apps found</p>
									<Button
										variant="outline"
										size="sm"
										className="h-5 px-2 text-xs"
										onClick={() => {
											fetchApps();
										}}
									>
										Reload page
									</Button>
								</div>
							) : (
								<div className="overflow-hidden w-full">
									<Table className="table-fixed">
										<TableBody className="[&_tr:last-child]:border-b">
											{apps.map((app) => (
												<TableRow key={app.id}>
													<TableRowItem
														isSelected={app.id === selectedApp?.id}
														title={app.data.id}
														badge1={
															isDevMode(app.data.script)
																? "dev mode"
																: undefined
														}
														event={app}
														onSelect={handleOnSelect}
														rightContent={
															scriptStatuses[app.data.script] && (
																<Badge
																	variant="outline"
																	className={`text-[10px] px-1.5 py-0 gap-1 ${getScriptStatusColor(scriptStatuses[app.data.script])}`}
																>
																	{scriptStatuses[app.data.script] ===
																	"checking" ? (
																		<Loader2 className="h-1.5 w-1.5 animate-spin" />
																	) : (
																		<Circle className="h-1.5 w-1.5 fill-current" />
																	)}
																	{getScriptStatusLabel(
																		scriptStatuses[app.data.script],
																	)}
																</Badge>
															)
														}
													/>
												</TableRow>
											))}
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
