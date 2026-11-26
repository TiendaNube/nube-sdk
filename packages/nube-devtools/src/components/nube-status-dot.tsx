import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

const STATES = {
	checking: {
		className: "bg-muted-foreground/50",
		label: "Detecting NubeSDK…",
	},
	detected: { className: "bg-green-500", label: "NubeSDK detected" },
	missing: { className: "bg-red-500", label: "NubeSDK not detected" },
};

/** Green when the page has the NubeSDK, red when it does not, grey while checking. */
export function NubeStatusDot({ status }: { status: boolean | null }) {
	const state =
		status === null
			? STATES.checking
			: status
				? STATES.detected
				: STATES.missing;

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<span
					role="img"
					aria-label={state.label}
					className={`inline-block size-2 shrink-0 rounded-full ${state.className}`}
				/>
			</TooltipTrigger>
			<TooltipContent>{state.label}</TooltipContent>
		</Tooltip>
	);
}
