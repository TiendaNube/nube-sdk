import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { ResizableHandle, ResizablePanel } from "@/components/ui/resizable";
import { ResizablePanelGroup } from "@/components/ui/resizable";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Table, TableBody, TableRow } from "@/components/ui/table";
import { useNubeSDKEventsContext } from "@/contexts/nube-sdk-events-context";
import type {
	NubeSDKEvent,
	NubeSDKEventData,
} from "@/contexts/nube-sdk-events-context";
import { EmptyState } from "@/devtools/components/empty-state";
import { JsonViewer } from "@/devtools/components/json-viewer";
import Layout from "@/devtools/components/layout";
import { SearchInput } from "@/devtools/components/search-input";
import { TableRowItem } from "@/devtools/components/table-row-item";
import { TrashIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

const STORAGE_KEY = "nube-devtools-events-page-width";
const SEARCH_STORAGE_KEY = "nube-devtools-filter-search";

export function Events() {
	const [selectedEvent, setSelectedEvent] = useState<NubeSDKEvent | null>(null);
	const { events, setEvents, clearEvents } = useNubeSDKEventsContext();
	const [filteredEvents, setFilteredEvents] = useState<NubeSDKEvent[]>([]);
	const [search, setSearch] = useState(() => {
		return localStorage.getItem(SEARCH_STORAGE_KEY) || "";
	});
	const tableContainerRef = useRef<HTMLDivElement>(null);
	const panelContainerRef = useRef<HTMLDivElement>(null);
	const [panelWidth, setPanelWidth] = useState<number>(0);

	useEffect(() => {
		setFilteredEvents(events.filter((event) => event.data[1].includes(search)));
	}, [events, search]);

	useEffect(() => {
		localStorage.setItem(SEARCH_STORAGE_KEY, search);
	}, [search]);

	useEffect(() => {
		if (panelContainerRef.current) {
			const resizeObserver = new ResizeObserver((entries) => {
				for (const entry of entries) {
					setPanelWidth(entry.contentRect.width);
				}
			});

			resizeObserver.observe(panelContainerRef.current);

			return () => {
				resizeObserver.disconnect();
			};
		}
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const listener = (port: chrome.runtime.Port) => {
			if (port.name === "nube-devtools-events") {
				port.onMessage.addListener((message) => {
					if (message.payload as NubeSDKEventData) {
						setEvents((prevEvents) => {
							return [...prevEvents, { id: uuidv4(), data: message.payload }];
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
			setTimeout(() => {
				if (tableContainerRef.current) {
					tableContainerRef.current.scrollTop =
						tableContainerRef.current.scrollHeight;
				}
			}, 0);
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

	const hasHiddenEvents =
		filteredEvents.length === 0 && events.length !== filteredEvents.length;

	return (
		<Layout>
			<div className="flex h-full flex-col">
				<nav className="flex items-center px-1.5 justify-between py-1 border-b h-[33px] shrink-0">
					<div className="flex items-center">
						<SidebarTrigger />
						<Divider />
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
					<Divider />
					<SearchInput value={search} onChange={setSearch} />
					{events.length > 0 && (
						<>
							<Divider />
							<span
								className={`text-xs px-2 whitespace-nowrap ${hasHiddenEvents ? "text-neutral-400" : ""}`}
							>
								{hasHiddenEvents
									? `${events.length} hidden`
									: `${filteredEvents.length} ${filteredEvents.length === 1 ? "event" : "events"}`}
							</span>
						</>
					)}
				</nav>
				<div className="flex-1 overflow-hidden">
					<ResizablePanelGroup
						autoSaveId={STORAGE_KEY}
						storage={localStorage}
						direction="horizontal"
					>
						<ResizablePanel defaultSize={40}>
							<div
								ref={tableContainerRef}
								className="h-full overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700 dark:[&::-webkit-scrollbar-thumb:hover]:bg-gray-600"
							>
								{events.length === 0 ? (
									<EmptyState
										text="No events found"
										buttonText="Reload page"
										onButtonClick={() => {
											chrome.devtools.inspectedWindow.reload();
										}}
									/>
								) : (
									<Table>
										<TableBody>
											{filteredEvents.map((event) => (
												<TableRow key={event.id}>
													<TableRowItem
														isSelected={event.id === selectedEvent?.id}
														title={event.data[1]}
														onResend={(data) => handleReplayEvent(data.data)}
														event={event}
														onSelect={setSelectedEvent}
													/>
												</TableRow>
											))}
										</TableBody>
									</Table>
								)}
							</div>
						</ResizablePanel>
						<ResizableHandle />
						<ResizablePanel>
							<div ref={panelContainerRef} className="h-full">
								<div
									className="flex h-full overflow-y-auto [scrollbar-width:none]"
									style={{ width: `${panelWidth}px` }}
								>
									{selectedEvent && (
										<div className="text-sm w-full">
											<JsonViewer className="p-2" data={selectedEvent.data} />
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
