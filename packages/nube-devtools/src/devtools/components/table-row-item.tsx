import { Badge } from "@/components/ui/badge";
import { TableCell } from "@/components/ui/table";
import { Repeat } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

type Event<T> = {
	id: string;
	data: T;
};

type TableRowItemProps<T> = {
	event: Event<T>;
	title: string;
	badge1?: string;
	badge2?: string;
	isSelected: boolean;
	onSelect: (event: Event<T>) => void;
	onResend?: (event: Event<T>) => void;
	rightContent?: ReactNode;
};

export function TableRowItem<T>({
	event,
	onSelect,
	isSelected,
	onResend,
	title: text,
	badge1,
	badge2,
	rightContent,
}: TableRowItemProps<T>) {
	const [isHighlighted, setIsHighlighted] = useState(true);

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsHighlighted(false);
		}, 600);

		return () => clearTimeout(timer);
	}, []);

	const handleResend = () => {
		if (onResend) {
			onResend(event);
		}
	};

	return (
		<TableCell
			onClick={() => onSelect(event)}
			className={`p-0 cursor-pointer transition-colors duration-1000 ${isHighlighted ? "bg-amber-500/20" : ""} ${isSelected ? "shadow-[inset_2px_0_0_0_rgb(180,83,9)]" : ""}`}
		>
			<div className="flex items-center w-full min-w-0">
				<div className="flex-1 flex items-center gap-1 min-w-0 shrink overflow-hidden px-3 py-2">
					<span className="truncate block">{text}</span>
					{badge1 && (
						<Badge
							className="text-[10px] px-1 py-0.5 shrink-0"
							variant="outline"
						>
							{badge1}
						</Badge>
					)}
					{badge2 && (
						<Badge
							className="text-[10px] px-1 py-0.5 shrink-0"
							variant="outline"
						>
							{badge2}
						</Badge>
					)}
				</div>
				<div className="flex items-center gap-1 pr-2 shrink-0">
					{rightContent}
					{onResend && (
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								handleResend();
							}}
							className="h-6 w-6 p-0 inline-flex items-center justify-center rounded-md border border-input bg-background text-sm hover:bg-accent hover:text-accent-foreground"
						>
							<Repeat className="h-3 w-3 transition-all duration-300 ease-in-out" />
						</button>
					)}
				</div>
			</div>
		</TableCell>
	);
}
