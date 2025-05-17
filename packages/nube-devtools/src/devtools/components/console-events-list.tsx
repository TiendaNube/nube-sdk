import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/devtools/components/empty-state";
import { TableRowItem } from "@/devtools/components/table-row-item";
import type { ConsoleMessage } from "@/devtools/hooks/use-console-events";
import type { ConsoleEvent } from "@/contexts/console-events-context";
import { useConsoleEventsContext } from "@/contexts/console-events-context";

interface ConsoleEventsListProps {
	events: Array<ConsoleEvent>;
	filteredEvents: Array<ConsoleEvent>;
	selectedEventId: string | null;
	onEventSelect: (event: { id: string; data: ConsoleMessage }) => void;
	onReload: () => void;
}

const getMethodBackground = (method: string) => {
	switch (method) {
		case "log":
			return "bg-primary/10";
		case "warn":
			return "bg-yellow-500/10";
		case "error":
			return "bg-destructive/10";
		case "info":
			return "bg-blue-500/10";
		default:
			return "";
	}
};

const getEventArgDisplay = (arg: unknown): string => {
	if (typeof arg === "string") {
		return arg;
	}

	return JSON.stringify(arg);
};

export function ConsoleEventsList({
	events,
	filteredEvents,
	selectedEventId,
	onEventSelect,
	onReload,
}: ConsoleEventsListProps) {
	const { markAsShown } = useConsoleEventsContext();

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
										{getEventArgDisplay(event.data.args[0])}
									</span>

									<Badge
										className={`text-[10px] px-1 py-0.5 ${getMethodBackground(event.data.method)}`}
										variant="outline"
									>
										{event.data.method}
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
