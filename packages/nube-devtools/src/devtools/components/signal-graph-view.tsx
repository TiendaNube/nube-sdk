import {
	type GraphNode,
	type SignalGraphLayout,
	connectedNodeIds,
} from "@/utils/signal-graph";
import { useMemo } from "react";
import { KIND_ICON, KIND_ICON_CLASS } from "./signal-id";

const NODE_WIDTH = 168;
/** Characters of the 11px and 10px monospace lines that fit a node. */
const LABEL_LENGTH = 23;
const DETAIL_LENGTH = 22;
/** Side of the icon that opens the second line. */
const ICON_SIZE = 10;
const NODE_HEIGHT = 34;
const COLUMN_GAP = 56;
const ROW_GAP = 10;
const PADDING = 12;

const KIND_CLASS: Record<GraphNode["kind"], string> = {
	signal: "fill-amber-500/10 stroke-amber-500/60",
	computed: "fill-violet-500/10 stroke-violet-500/60",
	effect: "fill-rose-500/10 stroke-rose-500/60",
	use: "fill-sky-500/10 stroke-sky-500/60",
};

/** A signal that never left the app's worker: grey, not the color of its kind. */
const WORKER_ONLY_CLASS = "fill-slate-500/20 stroke-slate-500/70";

const KIND_LABEL: Record<GraphNode["kind"], string> = {
	signal: "signal",
	computed: "computed",
	effect: "effect",
	use: "on the page",
};

const x = (node: GraphNode) =>
	PADDING + node.column * (NODE_WIDTH + COLUMN_GAP);
const y = (node: GraphNode) => PADDING + node.row * (NODE_HEIGHT + ROW_GAP);

/** Cuts a label to what fits a node; the full text stays in the tooltip. */
function fit(text: string, max: number): string {
	return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

type SignalGraphViewProps = {
	layout: SignalGraphLayout;
	/** The selected signal: it and what it is connected to stay lit. */
	selectedId: string | null;
	onSelect: (signalId: string) => void;
};

/**
 * The reactive graph of one app, left to right: signals, the computed
 * signals derived from them, then the effects and the spots of the page that
 * read them.
 */
export function SignalGraphView({
	layout,
	selectedId,
	onSelect,
}: SignalGraphViewProps) {
	const byId = useMemo(
		() => new Map(layout.nodes.map((node) => [node.id, node])),
		[layout],
	);
	const lit = useMemo(
		() =>
			selectedId && byId.has(selectedId)
				? connectedNodeIds(layout.edges, selectedId)
				: null,
		[layout, byId, selectedId],
	);

	const width =
		PADDING * 2 +
		layout.columns * NODE_WIDTH +
		Math.max(0, layout.columns - 1) * COLUMN_GAP;
	const height =
		PADDING * 2 +
		layout.rows * NODE_HEIGHT +
		Math.max(0, layout.rows - 1) * ROW_GAP;

	return (
		<svg
			width={width}
			height={height}
			viewBox={`0 0 ${width} ${height}`}
			role="img"
			aria-label="Signal graph"
			className="block font-mono text-[11px]"
		>
			{layout.edges.map((edge) => {
				const from = byId.get(edge.from);
				const to = byId.get(edge.to);
				if (!from || !to) return null;

				const x1 = x(from) + NODE_WIDTH;
				const y1 = y(from) + NODE_HEIGHT / 2;
				const x2 = x(to);
				const y2 = y(to) + NODE_HEIGHT / 2;
				const bend = (x2 - x1) / 2;
				const isLit = !lit || (lit.has(edge.from) && lit.has(edge.to));
				// With a selection, only its own edges are worth following; the
				// rest stays as a faint trace of the shape of the graph.
				const opacity = !lit ? 0.45 : isLit ? 1 : 0.12;

				return (
					<path
						key={`${edge.from}→${edge.to}`}
						d={`M${x1},${y1} C${x1 + bend},${y1} ${x2 - bend},${y2} ${x2},${y2}`}
						fill="none"
						strokeWidth={isLit && lit ? 1.5 : 1}
						className={
							isLit && lit
								? "stroke-foreground/70"
								: "stroke-muted-foreground/40"
						}
						opacity={opacity}
					/>
				);
			})}

			{layout.nodes.map((node) => {
				const isLit = !lit || lit.has(node.id);
				const isSelected = node.id === selectedId;
				const clickable = node.signalId !== undefined;
				const Icon = KIND_ICON[node.kind];

				return (
					// biome-ignore lint/a11y/useKeyWithClickEvents: every signal of the graph is also a row of the list, which is the keyboard path
					<g
						key={node.id}
						transform={`translate(${x(node)},${y(node)})`}
						className={clickable ? "cursor-pointer" : undefined}
						onClick={
							clickable ? () => onSelect(node.signalId as string) : undefined
						}
					>
						{/* Opaque, and never dimmed: an edge between two other columns
						    passes behind the nodes in its way, not through their text. */}
						<rect
							width={NODE_WIDTH}
							height={NODE_HEIGHT}
							rx={4}
							className="fill-background"
						/>
						<g opacity={!isLit ? 0.3 : node.inactive ? 0.55 : 1}>
							<title>
								{`${KIND_LABEL[node.kind]}${node.signalId && node.kind !== "use" ? ` ${node.signalId}` : ""}: ${node.prefix ? `${node.prefix} ` : ""}${node.label}${node.detail && node.kind === "use" ? ` (${node.detail})` : ""}${node.internal ? " — worker only: the page has no value for it" : ""}${
									node.problem ? " — the page is not following it" : ""
								}${node.inactive ? " — in a branch that is not mounted" : ""}`}
							</title>
							<rect
								width={NODE_WIDTH}
								height={NODE_HEIGHT}
								rx={4}
								strokeWidth={isSelected ? 2 : 1}
								strokeDasharray={node.internal ? "4 3" : undefined}
								className={
									node.problem
										? "fill-red-500/10 stroke-red-500"
										: node.internal
											? WORKER_ONLY_CLASS
											: KIND_CLASS[node.kind]
								}
							/>
							<text x={8} y={14}>
								{node.prefix && (
									<tspan className="fill-muted-foreground">
										{node.prefix}{" "}
									</tspan>
								)}
								<tspan className="fill-foreground font-semibold">
									{fit(
										node.label,
										LABEL_LENGTH - (node.prefix ? node.prefix.length + 1 : 0),
									)}
								</tspan>
							</text>
							<Icon
								x={8}
								y={18.5}
								width={ICON_SIZE}
								height={ICON_SIZE}
								className={KIND_ICON_CLASS[node.kind]}
							/>
							{node.detail && (
								<text
									x={8 + ICON_SIZE + 3}
									y={27}
									className="fill-muted-foreground text-[10px]"
								>
									{fit(node.detail, DETAIL_LENGTH)}
								</text>
							)}
						</g>
					</g>
				);
			})}
		</svg>
	);
}
