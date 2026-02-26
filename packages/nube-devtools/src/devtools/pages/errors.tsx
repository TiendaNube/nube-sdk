import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useNubeSDKErrorsContext } from "@/contexts/nube-sdk-errors-context";
import { EmptyState } from "@/devtools/components/empty-state";
import {
	ChevronDownIcon,
	ChevronRightIcon,
	CopyIcon,
	TrashIcon,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import Layout from "../components/layout";

const STORAGE_KEY = "nube-devtools-errors-page-width";

type ErrorEntry = {
	appId: string;
	index: number;
	error: unknown;
};

function getErrorLabel(error: unknown): string {
	if (typeof error === "string") return error;
	if (typeof error === "object" && error !== null) {
		const err = error as Record<string, unknown>;
		if (typeof err.message === "string") return err.message;
		if (typeof err.name === "string") return err.name;
	}
	return "Unknown error";
}

export function Errors() {
	const { appsErrors, totalErrors, clearErrors } = useNubeSDKErrorsContext();
	const [expandedApps, setExpandedApps] = useState<Set<string>>(new Set());
	const [selectedError, setSelectedError] = useState<ErrorEntry | null>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const getErrorText = useCallback((error: unknown): string => {
		if (typeof error === "string") return error;
		return JSON.stringify(error, null, 2);
	}, []);

	const handleCopyError = useCallback(async () => {
		const el = textareaRef.current;
		if (!el) return;
		try {
			await navigator.clipboard.writeText(el.value);
			toast.success("Error copied to clipboard");
		} catch {
			el.select();
			document.execCommand("copy"); // eslint-disable-line @typescript-eslint/no-deprecated
			toast.success("Error copied to clipboard");
		}
	}, []);

	const toggleApp = (appId: string) => {
		setExpandedApps((prev) => {
			const next = new Set(prev);
			if (next.has(appId)) {
				next.delete(appId);
			} else {
				next.add(appId);
			}
			return next;
		});
	};

	const handleClear = () => {
		clearErrors();
		setSelectedError(null);
		setExpandedApps(new Set());
	};

	const appIds = Object.keys(appsErrors);

	return (
		<Layout>
			<div className="flex h-full flex-col">
				<nav className="flex items-center px-1.5 justify-between py-1 border-b h-[33px] shrink-0">
					<div className="flex items-center">
						<SidebarTrigger />
						<Divider />
						<Button
							disabled={appIds.length === 0}
							variant="ghost"
							size="icon"
							className="h-6 w-6"
							onClick={handleClear}
						>
							<TrashIcon className="size-3" />
						</Button>
					</div>
					{totalErrors > 0 && (
						<span className="text-xs px-2 whitespace-nowrap">
							{totalErrors} {totalErrors === 1 ? "error" : "errors"}
						</span>
					)}
				</nav>
				<div className="flex-1 overflow-hidden">
					<ResizablePanelGroup
						autoSaveId={STORAGE_KEY}
						storage={localStorage}
						direction="horizontal"
					>
						<ResizablePanel defaultSize={40}>
							<div className="h-full overflow-x-hidden overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700 dark:[&::-webkit-scrollbar-thumb:hover]:bg-gray-600">
								{appIds.length === 0 ? (
									<EmptyState
										text="No errors found"
										buttonText="Reload page"
										onButtonClick={() => {
											chrome.devtools.inspectedWindow.reload();
										}}
									/>
								) : (
									<div className="flex flex-col">
										{appIds.map((appId) => {
											const errors = appsErrors[appId];
											const isExpanded = expandedApps.has(appId);

											return (
												<div key={appId} className="min-w-0">
													<button
														type="button"
														onClick={() => toggleApp(appId)}
														className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent transition-colors border-b"
													>
														{isExpanded ? (
															<ChevronDownIcon className="size-3 shrink-0" />
														) : (
															<ChevronRightIcon className="size-3 shrink-0" />
														)}
														<span className="font-medium truncate">
															App {appId}
														</span>
														<Badge
															variant="destructive"
															className="text-[10px] px-1.5 py-0 ml-auto shrink-0"
														>
															{errors.length}
														</Badge>
													</button>
													{isExpanded && (
														<div className="flex flex-col">
															{errors.map((error, index) => {
																const isSelected =
																	selectedError?.appId === appId &&
																	selectedError?.index === index;

																return (
																	<button
																		type="button"
																		key={`${appId}-${getErrorLabel(error)}-${index}`}
																		onClick={() =>
																			setSelectedError({
																				appId,
																				index,
																				error,
																			})
																		}
																		className={`flex items-center gap-2 w-full pl-8 pr-3 py-1.5 text-xs hover:bg-accent transition-colors border-b text-left ${
																			isSelected
																				? "shadow-[inset_2px_0_0_0_rgb(239,68,68)] bg-accent/50"
																				: ""
																		}`}
																	>
																		<span className="text-destructive shrink-0">
																			●
																		</span>
																		<span className="truncate text-muted-foreground">
																			{getErrorLabel(error)}
																		</span>
																	</button>
																);
															})}
														</div>
													)}
												</div>
											);
										})}
									</div>
								)}
							</div>
						</ResizablePanel>
						<ResizableHandle />
						<ResizablePanel>
							<div className="h-full flex flex-col">
								{selectedError && (
									<div className="flex items-center justify-end px-2 py-1 border-b shrink-0">
										<Button
											variant="ghost"
											size="sm"
											className="h-6 gap-1 text-xs"
											onClick={handleCopyError}
										>
											<CopyIcon className="size-3" />
											Copy
										</Button>
									</div>
								)}
								<div className="flex flex-1 overflow-y-auto [scrollbar-width:none]">
									{selectedError ? (
										<textarea
											ref={textareaRef}
											readOnly
											className="w-full h-full p-3 text-sm font-mono bg-transparent resize-none border-none outline-none text-foreground [scrollbar-width:thin]"
											value={getErrorText(selectedError.error)}
										/>
									) : (
										<div className="flex items-center justify-center w-full h-full">
											<p className="text-muted-foreground text-sm">
												Select an error to view details
											</p>
										</div>
									)}
								</div>
							</div>
						</ResizablePanel>
					</ResizablePanelGroup>
				</div>
			</div>
		</Layout>
	);
}
