import { cn } from "@/lib/utils";

interface DividerProps {
	className?: string;
}

function Divider({ className = "" }: DividerProps) {
	return (
		<div
			className={cn(
				"h-4 w-px m-1 bg-neutral-200 dark:bg-neutral-600",
				className,
			)}
		/>
	);
}

export { Divider };
