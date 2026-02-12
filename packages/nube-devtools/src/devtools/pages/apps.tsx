import type { NubeSDKApp } from "@/background/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Input } from "@/components/ui/input";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Table, TableBody, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import type { NubeSDKEvent } from "@/contexts/nube-sdk-apps-context";
import { useNubeSDKAppsContext } from "@/contexts/nube-sdk-apps-context";
import Layout from "@/devtools/components/layout";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
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

	const isDevMode = (script: string) => {
		return script.includes("localhost") || script.includes("127.0.0.1");
	};

	return (
		<Layout>
			<div className="flex h-full flex-col">
				<nav className="flex items-center justify-between px-1.5 py-1 border-b h-[33px] shrink-0">
					<div className="flex items-center">
						<SidebarTrigger />
						<Divider />
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6"
							onClick={() => {
								fetchApps();
								toast.success("Apps refreshed");
							}}
						>
							<RefreshCcw className="size-3" />
						</Button>
					</div>
					<span className="text-xs">
						{apps.length} {apps.length === 1 ? "app" : "apps"}
					</span>
				</nav>
				<div className="flex-1 min-h-0 overflow-hidden">
					<ResizablePanelGroup
						autoSaveId={STORAGE_KEY}
						storage={localStorage}
						direction="horizontal"
						className="min-h-0"
					>
						<ResizablePanel defaultSize={40} className="min-h-0">
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
								<div className="h-full overflow-auto min-h-0">
									<Table>
										<TableBody>
											{apps.map((app) => (
												<TableRow key={app.id}>
													<TableRowItem
														isSelected={app.data.id === selectedApp?.data.id}
														title={app.data.id}
														badge1={
															isDevMode(app.data.script)
																? "dev mode"
																: undefined
														}
														badge2={
															app.data.errors?.length
																? `${app.data.errors.length} error${app.data.errors.length !== 1 ? "s" : ""}`
																: undefined
														}
														badge2Variant={
															app.data.errors?.length ? "outline" : undefined
														}
														event={app}
														onSelect={handleOnSelect}
													/>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>
							)}
						</ResizablePanel>
						<ResizableHandle />
						<ResizablePanel className="min-h-0">
							{selectedApp && (
								<div className="p-4 flex flex-col gap-2 overflow-auto min-h-0 h-full">
									<div className="space-y-1 pb-4">
										<h4 className="text-sm font-medium leading-none">ID</h4>
										<Input
											className="w-auto"
											value={selectedApp.data.id}
											readOnly
											onClick={(e) => (e.target as HTMLInputElement).select()}
										/>
									</div>
									<div className="space-y-1 pb-4">
										<h4 className="text-sm font-medium leading-none">
											Registered
										</h4>
										<Input
											className="w-auto"
											value={selectedApp.data.registered ? "true" : "false"}
											readOnly
											onClick={(e) => (e.target as HTMLInputElement).select()}
										/>
									</div>
									<div className="space-y-1">
										<h4 className="text-sm font-medium leading-none">Script</h4>
										<div className="flex items-center gap-2">
											<Textarea
												className="w-auto max-w-[300px]"
												value={selectedApp.data.script}
												readOnly
												onClick={(e) =>
													(e.target as HTMLTextAreaElement).select()
												}
											/>
										</div>
									</div>
									{selectedApp.data.errors &&
										selectedApp.data.errors.length > 0 && (
											<Alert
												variant="destructive"
												className="mt-4 "
												aria-live="polite"
											>
												<div className="flex flex-col gap-1.5 min-w-0">
													<AlertDescription>
														<ul className="space-y-1.5 list-none pl-0 text-xs mt-0">
															{selectedApp.data.errors.map((message, index) => (
																<li
																	key={`${index}-${message.slice(0, 20)}`}
																	className="flex gap-2 before:content-['•'] items-start before:shrink-0 before:text-destructive"
																>
																	<span className="break-words">{message}</span>
																</li>
															))}
														</ul>
													</AlertDescription>
												</div>
											</Alert>
										)}
								</div>
							)}
						</ResizablePanel>
					</ResizablePanelGroup>
				</div>
			</div>
		</Layout>
	);
}
