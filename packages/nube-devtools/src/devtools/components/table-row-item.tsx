import { Button } from "@/components/ui/button";
import { TableCell } from "@/components/ui/table";
import { Repeat } from "lucide-react";
import { useEffect, useState } from "react";

type Event<T> = {
	id: string;
	shown: boolean;
	data: T;
};

type TableRowItemProps<T> = {
	data: Event<T>;
	children: React.ReactNode;
	isSelected: boolean;
	onSelect: (event: Event<T>) => void;
	onResend?: (event: Event<T>) => void;
	onShow?: () => void;
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
	data,
	onSelect,
	isSelected,
	onResend,
	onShow,
	children,
}: TableRowItemProps<T>) {
	const [isHighlighted, setIsHighlighted] = useState(true);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const timer = setTimeout(() => {
			setIsHighlighted(false);
			onShow?.();
		}, HIGHLIGHT_DURATION);

		return () => clearTimeout(timer);
	}, []);

	const handleResend = () => onResend?.(data);

	return (
		<TableCell
			className={`p-0 transition-colors duration-1000 ${
				isHighlighted && !data.shown ? HIGHLIGHT_COLOR : ""
			}`}
		>
			<div className="flex items-center justify-between w-full">
				<Button
					onClick={() => onSelect(data)}
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
