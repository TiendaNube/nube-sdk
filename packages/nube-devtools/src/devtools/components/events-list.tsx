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
	onReload: () => void;
}

export function EventsList({
	events,
	filteredEvents,
	selectedEvent,
	onSelect,
	onReplay,
	onReload,
}: EventsListProps) {
	if (events.length === 0) {
		return (
			<EmptyState
				text="No events found"
				buttonText="Reload page"
				onButtonClick={onReload}
			/>
		);
	}

	return (
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
	);
}
