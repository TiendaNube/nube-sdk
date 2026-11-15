import type { GraphNodeKind } from "@/utils/signal-graph";
import { shortSignalId } from "@/utils/signal-graph";
import {
	CogIcon,
	ComponentIcon,
	type LucideIcon,
	SquareFunctionIcon,
	ZapIcon,
} from "lucide-react";

/**
 * One icon per kind of node, the same everywhere a signal is mentioned: the
 * graph, the list, the side panel. The bolt is the one the Components page
 * already tags signals with.
 */
export const KIND_ICON: Record<GraphNodeKind, LucideIcon> = {
	signal: ZapIcon,
	computed: SquareFunctionIcon,
	effect: CogIcon,
	use: ComponentIcon,
};

/** Text color of each kind's icon, matching its box in the graph. */
export const KIND_ICON_CLASS: Record<GraphNodeKind, string> = {
	signal: "text-amber-600 dark:text-amber-400",
	computed: "text-violet-600 dark:text-violet-400",
	effect: "text-rose-600 dark:text-rose-400",
	use: "text-sky-600 dark:text-sky-400",
};

/**
 * A signal id the way the panel writes it: the icon of its kind and what
 * comes after `signal-<appId>-`. The prefix and the app id are the same for
 * every signal of an app and say nothing; the whole id stays in the tooltip.
 */
export function SignalId({
	id,
	kind = "signal",
	className = "",
}: {
	id: string;
	/** Unknown without the app's graph: drawn as a plain signal. */
	kind?: "signal" | "computed";
	className?: string;
}) {
	const Icon = KIND_ICON[kind];

	return (
		<span
			className={`inline-flex shrink-0 items-center gap-0.5 font-mono ${className}`}
			title={kind === "computed" ? `Computed signal ${id}` : `Signal ${id}`}
		>
			<Icon className={`size-3 ${KIND_ICON_CLASS[kind]}`} />
			{shortSignalId(id)}
		</span>
	);
}
