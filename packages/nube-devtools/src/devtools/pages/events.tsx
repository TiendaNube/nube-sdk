import { Button } from "@/components/ui/button";
import { ResizableHandle, ResizablePanel } from "@/components/ui/resizable";
import { ResizablePanelGroup } from "@/components/ui/resizable";
import { EventsList } from "@/devtools/components/events-list";
import { EventsNav } from "@/devtools/components/events-nav";
import { JsonViewer } from "@/devtools/components/json-viewer";
import Layout from "@/devtools/components/layout";
import { useEvents } from "@/devtools/hooks/use-events";
import { XIcon } from "lucide-react";

const STORAGE_KEY = "nube-devtools-events-page-width";

export function Events() {
	const {
		selectedEvent,
		setSelectedEvent,
		events,
		filteredEvents,
		search,
		setSearch,
		handleClearList,
		handleReplayEvent,
		hasHiddenEvents,
	} = useEvents();

	return (
		<Layout>
			<div className="flex h-full flex-col">
				<EventsNav
					eventsCount={events.length}
					filteredEventsCount={filteredEvents.length}
					hasHiddenEvents={hasHiddenEvents}
					search={search}
					onSearchChange={setSearch}
					onClear={handleClearList}
				/>
				<div className="flex-1 overflow-hidden">
					<ResizablePanelGroup
						autoSaveId={STORAGE_KEY}
						storage={localStorage}
						direction="horizontal"
					>
						<ResizablePanel defaultSize={40}>
							<EventsList
								events={events}
								filteredEvents={filteredEvents}
								selectedEvent={selectedEvent}
								onSelect={setSelectedEvent}
								onReplay={handleReplayEvent}
							/>
						</ResizablePanel>
						{selectedEvent && (
							<>
								<ResizableHandle />
								<ResizablePanel>
									<nav className="flex items-center px-1.5 justify-between py-1 border-b h-[33px] shrink-0">
										<div className="flex items-center">
											<Button
												className="h-6 w-6"
												variant="ghost"
												size="icon"
												onClick={() => setSelectedEvent(null)}
											>
												<XIcon className="size-3" />
											</Button>
										</div>
									</nav>
									<div className="h-full">
										<div
											className="flex h-full overflow-y-auto [scrollbar-width:none]"
										>
											{selectedEvent && (
												<div className="text-sm w-full">
													<JsonViewer
														className="p-2"
														data={selectedEvent.data}
													/>
												</div>
											)}
										</div>
									</div>
								</ResizablePanel>
							</>
						)}
					</ResizablePanelGroup>
				</div>
			</div>
		</Layout>
	);
}
