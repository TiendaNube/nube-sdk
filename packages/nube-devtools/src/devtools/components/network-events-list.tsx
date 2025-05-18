import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableRow } from "@/components/ui/table";
import type { NetworkEvent } from "@/contexts/network-events-context";
import { useNetworkEventsContext } from "@/contexts/network-events-context";
import { EmptyState } from "@/devtools/components/empty-state";
import { TableRowItem } from "@/devtools/components/table-row-item";

interface NetworkEventsListProps {
	events: Array<NetworkEvent>;
	filteredEvents: Array<NetworkEvent>;
	selectedEventId: string | null;
	onEventSelect: (event: NetworkEvent) => void;
	onReload: () => void;
}

const getMethodBackground = (method: string) => {
	switch (method) {
		case "GET":
			return "bg-primary/10";
		case "POST":
			return "bg-green-500/10";
		case "PUT":
			return "bg-yellow-500/10";
		case "DELETE":
			return "bg-destructive/10";
		default:
			return "";
	}
};

export function NetworkEventsList({
	events,
	filteredEvents,
	selectedEventId,
	onEventSelect,
	onReload,
}: NetworkEventsListProps) {
	const { markAsShown } = useNetworkEventsContext();

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
							data={event}
							isSelected={selectedEventId === event.id}
							onSelect={() => onEventSelect(event)}
							onShow={() => markAsShown(event.id)}
						>
							<div className="flex items-center w-full justify-between">
								<div className="flex items-center gap-1">
									<span className="text-xs truncate max-w-[200px]">
										{event.data.url}
									</span>

									<Badge
										className={`text-[10px] px-1 py-0.5 ${getMethodBackground(event.data.method ?? "")}`}
										variant="outline"
									>
										{event.data.method}
									</Badge>
									<Badge className="text-[10px] px-1 py-0.5" variant="outline">
										{!event.data.status ? "pending" : event.data.status}
									</Badge>
								</div>
								<Badge className="text-[10px] px-1 py-0.5" variant="outline">
									{event.data.app}
								</Badge>
							</div>
						</TableRowItem>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
