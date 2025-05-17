import { Table, TableBody, TableRow } from "@/components/ui/table";
import type {
	NubeSDKEvent,
	NubeSDKEventData,
} from "@/contexts/nube-sdk-events-context";
import { EmptyState } from "@/devtools/components/empty-state";
import { TableRowItem } from "@/devtools/components/table-row-item";
import { useEffect, useRef } from "react";

interface EventsListProps {
	events: NubeSDKEvent[];
	filteredEvents: NubeSDKEvent[];
	selectedEvent: NubeSDKEvent | null;
	onSelect: (event: NubeSDKEvent) => void;
	onReplay: (event: NubeSDKEventData) => void;
}

export function EventsList({
	events,
	filteredEvents,
	selectedEvent,
	onSelect,
	onReplay,
}: EventsListProps) {
	const tableContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (tableContainerRef.current) {
			setTimeout(() => {
				if (tableContainerRef.current) {
					tableContainerRef.current.scrollTop =
						tableContainerRef.current.scrollHeight;
				}
			}, 0);
		}
	}, []);

	return (
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
									onResend={(data) => onReplay(data.data)}
									data={event}
									onSelect={onSelect}
								>
									<span>{event.data[1]}</span>
								</TableRowItem>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}
		</div>
	);
}
