import { Button } from "@/components/ui/button";
import type { PanelDirection } from "@/hooks/use-panel-direction";
import { Columns2Icon, Rows2Icon } from "lucide-react";

type PanelDirectionToggleProps = {
	direction: PanelDirection;
	onToggle: () => void;
};

export function PanelDirectionToggle({
	direction,
	onToggle,
}: PanelDirectionToggleProps) {
	// The icon shows the layout the click switches to.
	const isHorizontal = direction === "horizontal";
	const Icon = isHorizontal ? Rows2Icon : Columns2Icon;
	const label = isHorizontal
		? "Stack panels vertically"
		: "Show panels side by side";

	return (
		<Button
			variant="ghost"
			size="icon"
			className="h-6 w-6 shrink-0"
			title={label}
			aria-label={label}
			onClick={onToggle}
		>
			<Icon className="size-3" />
		</Button>
	);
}
