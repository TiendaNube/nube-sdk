import { useDevToolsTheme } from "@/contexts/devtools-theme-context";
import { cn } from "@/lib/utils";

interface DividerProps {
	className?: string;
}

function Divider({ className = "" }: DividerProps) {
	const { theme } = useDevToolsTheme(); // TODO: remove this and use the theme from the tailwind config

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
