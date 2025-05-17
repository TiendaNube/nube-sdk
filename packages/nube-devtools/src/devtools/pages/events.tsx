import { ResizableHandle, ResizablePanel } from "@/components/ui/resizable";
import { ResizablePanelGroup } from "@/components/ui/resizable";
import { JsonViewer } from "@/devtools/components/json-viewer";
import Layout from "@/devtools/components/layout";
import { EventsNav } from "@/devtools/components/events-nav";
import { EventsList } from "@/devtools/components/events-list";
import { useEvents } from "@/devtools/hooks/use-events";
import { useEventsPanel } from "@/devtools/hooks/use-events-panel";

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

	const { panelContainerRef, panelWidth } = useEventsPanel();

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
