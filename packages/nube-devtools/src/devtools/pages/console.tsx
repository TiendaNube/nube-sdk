import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Table, TableRow } from "@/components/ui/table";
import { TableBody } from "@/components/ui/table";
import Layout from "@/devtools/components/layout";
import { useConsoleEvents } from "@/devtools/hooks/use-console-events";
import type { ConsoleMessage } from "@/devtools/hooks/use-console-events";
import { TrashIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ConsoleDetailsPanel } from "../components/console-details-panel";
import { ConsoleEventsList } from "../components/console-events-list";
import { ConsoleNav } from "../components/console-nav";
import { EmptyState } from "../components/empty-state";
import { JsonViewer } from "../components/json-viewer";
import { TableRowItem } from "../components/table-row-item";
import { useConsoleFilter } from "../hooks/use-console-filter";
import { useEventsPanel } from "../hooks/use-events-panel";

const STORAGE_KEY = "nube-devtools-console-events";

export function Console() {
	const { panelContainerRef, panelWidth } = useEventsPanel();
	const { events, clear } = useConsoleEvents();
	const { search, setSearch, filteredEvents, hasHiddenEvents } =
		useConsoleFilter(events);
	const [selectedEvent, setSelectedEvent] = useState<{
		id: string;
		data: ConsoleMessage;
	} | null>(null);
	const tableContainerRef = useRef<HTMLDivElement>(null);
	const lastEventsCountRef = useRef(events.length);

	useEffect(() => {
		if (
			tableContainerRef.current &&
			events.length !== lastEventsCountRef.current
		) {
			tableContainerRef.current.scrollTop =
				tableContainerRef.current.scrollHeight;
			lastEventsCountRef.current = events.length;
		}
	}, [events.length]);

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
						<ResizableHandle />
						<ResizablePanel>
							<div ref={panelContainerRef} className="h-full">
								<ConsoleDetailsPanel
									selectedEvent={selectedEvent}
									panelWidth={panelWidth}
								/>
							</div>
						</ResizablePanel>
					</ResizablePanelGroup>
				</div>
			</div>
		</Layout>
	);
}
