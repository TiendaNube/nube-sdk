import { Button } from "@/components/ui/button";
import { ResizableHandle, ResizablePanel } from "@/components/ui/resizable";
import { ResizablePanelGroup } from "@/components/ui/resizable";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Table, TableBody, TableRow } from "@/components/ui/table";
import { useNubeSDKEventsContext } from "@/contexts/nube-sdk-events-context";
import type {
	NubeSDKEvent,
	NubeSDKEventData,
} from "@/contexts/nube-sdk-events-context";
import { JsonViewer } from "@/devtools/components/json-viewer";
import Layout from "@/devtools/components/layout";
import { TableRowItem } from "@/devtools/components/table-row-item";
import { TrashIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

const STORAGE_KEY = "nube-devtools-events-page-width";

export function Events() {
	const [selectedEvent, setSelectedEvent] = useState<NubeSDKEvent | null>(null);
	const { events, setEvents, clearEvents } = useNubeSDKEventsContext();
	const tableContainerRef = useRef<HTMLDivElement>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const listener = (port: chrome.runtime.Port) => {
			if (port.name === "nube-devtools-events") {
				port.onMessage.addListener((message) => {
					if (message.payload as NubeSDKEventData) {
						setEvents((prevEvents) => {
							return [
								...prevEvents,
								{
									id: uuidv4(),
									data: message.payload,
								},
							];
						});

						port.disconnect();
					}
				});
			}
		};

		chrome.runtime.onConnect.addListener(listener);

		return () => {
			chrome.runtime.onConnect.removeListener(listener);
		};
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (tableContainerRef.current) {
			tableContainerRef.current.scrollTop =
				tableContainerRef.current.scrollHeight -
				tableContainerRef.current.clientHeight;
		}
	}, [events]);

	const handleClearList = () => {
		setSelectedEvent(null);
		clearEvents();
	};

	const handleReplayEvent = (event: NubeSDKEventData) => {
		chrome.runtime.sendMessage(
			{
				action: "nube-devtools-replay-event",
				payload: {
					tabId: chrome.devtools.inspectedWindow.tabId,
					state: event[0],
					event: event[1],
					appId: event[2],
				},
			},
			(response: { status: boolean }) => {
				if (response.status) {
					toast.success("Event resent successfully");
				} else {
					toast.error("Failed to resend event");
				}
			},
		);
	};

	return (
		<Layout>
			<ResizablePanelGroup
				autoSaveId={STORAGE_KEY}
				storage={localStorage}
				direction="horizontal"
			>
				<ResizablePanel defaultSize={40}>
					<nav className="flex items-center justify-between px-1.5 py-1 border-b">
						<div className="flex items-center">
							<SidebarTrigger />
							<div className="h-4 w-px bg-neutral-600 mx-2" />
							<Button
								disabled={events.length === 0}
								variant="ghost"
								size="icon"
								className="h-6 w-6"
								onClick={handleClearList}
							>
								<TrashIcon className="size-3" />
							</Button>
						</div>
						<span className="text-xs">
							{events.length} {events.length === 1 ? "event" : "events"}
						</span>
					</nav>
					<div
						ref={tableContainerRef}
						className="h-[calc(100%-33px)] overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700 dark:[&::-webkit-scrollbar-thumb:hover]:bg-gray-600"
					>
						{events.length === 0 ? (
							<div className="flex h-full flex-col items-center justify-center gap-2">
								<p className="text-sm">No events found</p>
								<Button
									variant="outline"
									size="sm"
									className="h-5 px-2 text-xs"
									onClick={() => {
										chrome.devtools.inspectedWindow.reload();
									}}
								>
									Reload page
								</Button>
							</div>
						) : (
							<Table>
								<TableBody>
									{events.map((event) => {
										return (
											<TableRow key={event.id}>
												<TableRowItem
													isSelected={event.id === selectedEvent?.id}
													title={event.data[1]}
													onResend={(data) => handleReplayEvent(data.data)}
													event={event}
													onSelect={setSelectedEvent}
												/>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						)}
					</div>
				</ResizablePanel>
				<ResizableHandle />
				<ResizablePanel>
					<div className="flex h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
						{selectedEvent && (
							<div className="text-sm">
								<JsonViewer className="p-2" data={selectedEvent.data} />
							</div>
						)}
					</div>
				</ResizablePanel>
			</ResizablePanelGroup>
		</Layout>
	);
}
