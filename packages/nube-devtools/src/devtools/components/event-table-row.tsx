import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import type { NubeSDKEvent } from "@/contexts/nube-sdk-events-context";
import { Copy, ListFilterPlus, Repeat } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export type EventCellField = "sender" | "target" | "event";

type EventTableRowProps = {
	event: NubeSDKEvent;
	isSelected: boolean;
	onSelect: (event: NubeSDKEvent) => void;
	onResend: (event: NubeSDKEvent) => void;
	onAddToFilter: (field: EventCellField, value: string) => void;
};

function EventContextMenuContent({
	field,
	value,
	event,
	onAddToFilter,
	onResend,
}: {
	field: EventCellField;
	value: string;
	event: NubeSDKEvent;
	onAddToFilter: (field: EventCellField, value: string) => void;
	onResend: (event: NubeSDKEvent) => void;
}) {
	return (
		<ContextMenuContent>
			<ContextMenuItem onSelect={() => onAddToFilter(field, value)}>
				<ListFilterPlus className="h-3 w-3 mr-2" />
				Add to filter:
				<span className="text-muted-foreground ml-1">
					{field}=&quot;{value}&quot;
				</span>
			</ContextMenuItem>
			<ContextMenuItem
				onSelect={() => {
					navigator.clipboard.writeText(value).then(() => {
						toast.success("Copied to clipboard");
					});
				}}
			>
				<Copy className="h-3 w-3 mr-2" />
				Copy {field}
			</ContextMenuItem>
			<ContextMenuItem onSelect={() => onResend(event)}>
				<Repeat className="h-3 w-3 mr-2" />
				Resend event
			</ContextMenuItem>
		</ContextMenuContent>
	);
}

export function EventTableRow({
	event,
	isSelected,
	onSelect,
	onResend,
	onAddToFilter,
}: EventTableRowProps) {
	const [isHighlighted, setIsHighlighted] = useState(true);

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsHighlighted(false);
		}, 600);

		return () => clearTimeout(timer);
	}, []);

	const sender = event.data[2] ?? "";
	const target = event.data[3] ?? "*";
	const eventName = event.data[1] ?? "";

	return (
		<TableRow
			onClick={() => onSelect(event)}
			className={`cursor-pointer transition-colors duration-1000 ${isHighlighted ? "bg-amber-500/20" : ""} ${isSelected ? "shadow-[inset_2px_0_0_0_rgb(180,83,9)]" : ""}`}
		>
			<ContextMenu>
				<ContextMenuTrigger asChild>
					<TableCell className="px-3 py-2 truncate border-r" title={sender}>
						{sender}
					</TableCell>
				</ContextMenuTrigger>
				<EventContextMenuContent
					field="sender"
					value={sender}
					event={event}
					onAddToFilter={onAddToFilter}
					onResend={onResend}
				/>
			</ContextMenu>

			<ContextMenu>
				<ContextMenuTrigger asChild>
					<TableCell className="px-3 py-2 truncate border-r" title={target}>
						{target}
					</TableCell>
				</ContextMenuTrigger>
				<EventContextMenuContent
					field="target"
					value={target}
					event={event}
					onAddToFilter={onAddToFilter}
					onResend={onResend}
				/>
			</ContextMenu>

			<TableCell className="px-3 py-2">
				<ContextMenu>
					<ContextMenuTrigger asChild>
						<span className="truncate block w-full min-w-0" title={eventName}>
							{eventName}
						</span>
					</ContextMenuTrigger>
					<EventContextMenuContent
						field="event"
						value={eventName}
						event={event}
						onAddToFilter={onAddToFilter}
						onResend={onResend}
					/>
				</ContextMenu>
			</TableCell>
		</TableRow>
	);
}
