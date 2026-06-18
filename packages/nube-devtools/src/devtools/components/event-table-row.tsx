import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import type { NubeSDKEvent } from "@/contexts/nube-sdk-events-context";
import { Repeat } from "lucide-react";
import { useEffect, useState } from "react";

export type EventCellField = "sender" | "target" | "event";

type EventTableRowProps = {
	event: NubeSDKEvent;
	isSelected: boolean;
	onSelect: (event: NubeSDKEvent) => void;
	onResend: (event: NubeSDKEvent) => void;
	onAddToFilter: (field: EventCellField, value: string) => void;
};

function FilterMenuItem({
	field,
	value,
	onAddToFilter,
}: {
	field: EventCellField;
	value: string;
	onAddToFilter: (field: EventCellField, value: string) => void;
}) {
	return (
		<ContextMenuItem onSelect={() => onAddToFilter(field, value)}>
			Add to filter:
			<span className="text-muted-foreground ml-1">
				{field}=&quot;{value}&quot;
			</span>
		</ContextMenuItem>
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
				<ContextMenuContent>
					<FilterMenuItem
						field="sender"
						value={sender}
						onAddToFilter={onAddToFilter}
					/>
				</ContextMenuContent>
			</ContextMenu>

			<ContextMenu>
				<ContextMenuTrigger asChild>
					<TableCell className="px-3 py-2 truncate border-r" title={target}>
						{target}
					</TableCell>
				</ContextMenuTrigger>
				<ContextMenuContent>
					<FilterMenuItem
						field="target"
						value={target}
						onAddToFilter={onAddToFilter}
					/>
				</ContextMenuContent>
			</ContextMenu>

			<TableCell className="px-3 py-2">
				<div className="flex items-center w-full min-w-0 gap-1">
					<ContextMenu>
						<ContextMenuTrigger asChild>
							<span className="truncate block flex-1 min-w-0" title={eventName}>
								{eventName}
							</span>
						</ContextMenuTrigger>
						<ContextMenuContent>
							<FilterMenuItem
								field="event"
								value={eventName}
								onAddToFilter={onAddToFilter}
							/>
						</ContextMenuContent>
					</ContextMenu>
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onResend(event);
						}}
						className="h-6 w-6 p-0 shrink-0 inline-flex items-center justify-center rounded-md border border-input bg-background text-sm hover:bg-accent hover:text-accent-foreground"
					>
						<Repeat className="h-3 w-3 transition-all duration-300 ease-in-out" />
					</button>
				</div>
			</TableCell>
		</TableRow>
	);
}
