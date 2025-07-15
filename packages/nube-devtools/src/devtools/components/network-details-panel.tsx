import type { NetworkEvent } from "@/contexts/network-events-context";
import { JsonViewer } from "./json-viewer";

interface NetworkDetailsPanelProps {
	selectedEvent?: NetworkEvent;
}

export function NetworkDetailsPanel({
	selectedEvent,
}: NetworkDetailsPanelProps) {
	if (!selectedEvent) {
		return null;
	}

	return (
		<div className="h-full">
			<div className="flex h-full overflow-y-auto [scrollbar-width:none]">
				<div className="text-sm w-full">
					<JsonViewer className="p-2" data={selectedEvent.data} />
				</div>
			</div>
		</div>
	);
}
