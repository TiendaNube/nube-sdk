import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell } from "@/components/ui/table";
import { Repeat } from "lucide-react";
import { useEffect, useState } from "react";

type Event<T> = {
	id: string;
	data: T;
};

type TableRowItemProps<T> = {
	event: Event<T>;
	children: React.ReactNode;
	isSelected: boolean;
	onSelect: (event: Event<T>) => void;
	onResend?: (event: Event<T>) => void;
};

const HIGHLIGHT_DURATION = 600;
const HIGHLIGHT_COLOR = "bg-amber-500/20";
const SELECTED_BORDER = "shadow-[inset_2px_0_0_0_rgb(180,83,9)]";

const ResendButton = ({ onClick }: { onClick: () => void }) => (
	<Button
		variant="outline"
		onClick={onClick}
		size="sm"
		className="h-6 w-6 p-0 absolute right-2"
	>
		<Repeat className="h-3 w-3 transition-all duration-300 ease-in-out" />
	</Button>
);

export function TableRowItem<T>({
	event,
	onSelect,
	isSelected,
	onResend,
	children,
}: TableRowItemProps<T>) {
	const [isHighlighted, setIsHighlighted] = useState(true);

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsHighlighted(false);
		}, HIGHLIGHT_DURATION);

		return () => clearTimeout(timer);
	}, []);

	const handleResend = () => onResend?.(event);

	return (
		<TableCell
			className={`p-0 transition-colors duration-1000 ${
				isHighlighted ? HIGHLIGHT_COLOR : ""
			}`}
		>
			<div className="flex items-center justify-between w-full">
				<Button
					onClick={() => onSelect(event)}
					variant="ghost"
					className={`relative cursor-pointer flex-1 justify-start rounded-none ${
						isSelected ? SELECTED_BORDER : ""
					}`}
				>
					{children}
				</Button>
				{onResend && <ResendButton onClick={handleResend} />}
			</div>
		</TableCell>
	);
}
