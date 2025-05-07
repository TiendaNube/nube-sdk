import { Button } from "@/components/ui/button";

interface EmptyStateProps {
	text: string;
	buttonText: string;
	onButtonClick: () => void;
}

export function EmptyState({
	text,
	buttonText,
	onButtonClick,
}: EmptyStateProps) {
	return (
		<div className="flex h-full flex-col items-center justify-center gap-2">
			<p className="text-sm">{text}</p>
			<Button
				variant="outline"
				size="sm"
				className="h-5 px-2 text-xs"
				onClick={onButtonClick}
			>
				{buttonText}
			</Button>
		</div>
	);
}
