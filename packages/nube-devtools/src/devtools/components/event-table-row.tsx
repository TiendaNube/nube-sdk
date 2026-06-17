import { TableCell, TableRow } from "@/components/ui/table";
import type { NubeSDKEvent } from "@/contexts/nube-sdk-events-context";
import { Repeat } from "lucide-react";
import { useEffect, useState } from "react";

type EventTableRowProps = {
	event: NubeSDKEvent;
	isSelected: boolean;
	onSelect: (event: NubeSDKEvent) => void;
	onResend: (event: NubeSDKEvent) => void;
};

export function EventTableRow({
	event,
	isSelected,
	onSelect,
	onResend,
}: EventTableRowProps) {
	const [isHighlighted, setIsHighlighted] = useState(true);

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsHighlighted(false);
		}, 600);

		return () => clearTimeout(timer);
	}, []);

	const sender = event.data[2];
	const target = event.data[3] ?? "*";
	const eventName = event.data[1];

	return (
		<TableRow
			onClick={() => onSelect(event)}
			className={`cursor-pointer transition-colors duration-1000 ${isHighlighted ? "bg-amber-500/20" : ""} ${isSelected ? "shadow-[inset_2px_0_0_0_rgb(180,83,9)]" : ""}`}
		>
			<TableCell className="px-3 py-2 truncate border-r" title={sender}>
				{sender}
			</TableCell>
			<TableCell className="px-3 py-2 truncate border-r" title={target}>
				{target}
			</TableCell>
			<TableCell className="px-3 py-2">
				<div className="flex items-center w-full min-w-0 gap-1">
					<span className="truncate block flex-1 min-w-0" title={eventName}>
						{eventName}
					</span>
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
