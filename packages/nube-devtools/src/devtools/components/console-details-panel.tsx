import type { ConsoleMessage } from "../hooks/use-console-events";
import { JsonViewer } from "./json-viewer";

interface ConsoleDetailsPanelProps {
	selectedEvent: { id: string; data: ConsoleMessage } | null;
}

export function ConsoleDetailsPanel({
	selectedEvent,
}: ConsoleDetailsPanelProps) {
	if (!selectedEvent) {
		return null;
	}

	if (
		selectedEvent.data.args.length === 1 &&
		typeof selectedEvent.data.args[0] === "string"
	) {
		return (
			<div className="h-full p-2">
				<div className="text-xs w-full">{selectedEvent.data.args[0]}</div>
			</div>
		);
	}

	return (
		<div className="h-full">
			<div
				className="flex h-full overflow-y-auto [scrollbar-width:none]"
			>
				<div className="text-sm w-full">
					<JsonViewer className="p-2" data={selectedEvent.data.args} />
				</div>
			</div>
		</div>
	);
}
