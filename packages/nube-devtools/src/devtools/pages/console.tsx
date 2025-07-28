import { Button } from "@/components/ui/button";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useConsoleEventsContext } from "@/contexts/console-events-context";
import Layout from "@/devtools/components/layout";
import type { ConsoleMessage } from "@/devtools/hooks/use-console-script";
import { XIcon } from "lucide-react";
import { useState } from "react";
import { ConsoleDetailsPanel } from "../components/console-details-panel";
import { ConsoleEventsList } from "../components/console-events-list";
import { ConsoleNav } from "../components/console-nav";
import { useConsoleFilter } from "../hooks/use-console-filter";
import { useScrollToBottom } from "../hooks/use-scroll-to-bottom";

const STORAGE_KEY = "nube-devtools-console-events";

export function Console() {
	const { events, clear } = useConsoleEventsContext();
	const { search, setSearch, filteredEvents, hasHiddenEvents } =
		useConsoleFilter(events);
	const [selectedEvent, setSelectedEvent] = useState<{
		id: string;
		data: ConsoleMessage;
	} | null>(null);
	const { containerRef: tableContainerRef } = useScrollToBottom<HTMLDivElement>(
		{
			dependencies: [events.length],
		},
	);

	const handleClear = () => {
		clear();
		setSelectedEvent(null);
	};

	const handleReload = () => {
		chrome.devtools.inspectedWindow.reload();
	};

	return (
		<Layout>
			<div className="flex h-full flex-col">
				<ConsoleNav
					eventsCount={events.length}
					filteredEventsCount={filteredEvents.length}
					hasHiddenEvents={hasHiddenEvents}
					search={search}
					onSearchChange={setSearch}
					onClear={handleClear}
				/>
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
								<ConsoleEventsList
									events={events}
									filteredEvents={filteredEvents}
									selectedEventId={selectedEvent?.id ?? null}
									onEventSelect={setSelectedEvent}
									onReload={handleReload}
								/>
							</div>
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
										<ConsoleDetailsPanel selectedEvent={selectedEvent} />
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
