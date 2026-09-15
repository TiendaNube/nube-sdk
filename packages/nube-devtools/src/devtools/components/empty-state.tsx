import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface EmptyStateProps {
	text: string;
	buttonText: string;
	onButtonClick: () => void;
	isLoading?: boolean;
}

export function EmptyState({
	text,
	buttonText,
	onButtonClick,
	isLoading = false,
}: EmptyStateProps) {
	return (
		<div className="flex h-full flex-col items-center justify-center gap-2">
			<p className="text-sm">{text}</p>
			<Button
				variant="outline"
				size="sm"
				className="h-5 px-2 text-xs"
				onClick={onButtonClick}
				disabled={isLoading}
			>
				{isLoading && <Loader2 className="size-3 animate-spin" />}
				{buttonText}
			</Button>
		</div>
	);
}
