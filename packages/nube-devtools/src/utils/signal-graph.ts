/**
 * Lays out the reactive graph of one app: its signals, the computed signals
 * derived from them, and where the values end up — an effect in the app, or
 * a spot of the page.
 *
 * Everything flows left to right, so a column is a distance from the source
 * signals: column 0 holds plain signals, a computed signal sits one column
 * after its furthest source, and effects and page uses share the last one.
 */
import { formatValue } from "./conditions";
import type { SignalRow } from "./signal-bindings";

/**
 * - `signal` / `computed`: nodes of the app;
 * - `effect`: an effect of the app;
 * - `use`: one or more spots of the page bound to a signal.
 */
export type GraphNodeKind = "signal" | "computed" | "effect" | "use";

export type GraphNode = {
	/** Unique in the layout. For signals, the signal id. */
	id: string;
	kind: GraphNodeKind;
	/**
	 * The main line. For a signal on the page, its current value; otherwise
	 * what the node is (`signal`, `computed`, `effect`, a component).
	 */
	label: string;
	/**
	 * What `label` is, read before it and less prominent: `value:` for a
	 * signal, `computed:` for a computed one.
	 */
	prefix?: string;
	/**
	 * Second line, discreet, next to the icon of the kind: the short id of a
	 * signal or effect, the role of a use.
	 */
	detail?: string;
	column: number;
	/** Position within the column, from the top. */
	row: number;
	/**
	 * The signal to select when the node is clicked: itself for a signal, the
	 * bound signal for a use. Effects select nothing.
	 */
	signalId?: string;
	/**
	 * `signal` / `computed`: worker only. The app never passed it to a
	 * component, so the page has no value for it.
	 */
	internal?: boolean;
	/** `signal` / `computed`: something keeps the page from following it. */
	problem?: boolean;
	/** `use`: every spot it stands for is in a branch that is not mounted. */
	inactive?: boolean;
};

/** `to` reads `from`. */
export type GraphEdge = { from: string; to: string };

export type SignalGraphLayout = {
	nodes: GraphNode[];
	edges: GraphEdge[];
	columns: number;
	/** Height of the tallest column, in nodes. */
	rows: number;
};

/** Longest value written in a node; the whole value is in the side panel. */
const VALUE_LENGTH = 40;

const ROLE_DETAIL = {
	text: "text",
	prop: "prop",
	show: "when",
	match: "of",
} as const;

/**
 * What comes after `signal-<appId>-` (or `effect-`): the only part of an id
 * that tells two signals of an app apart.
 */
export function shortSignalId(id: string): string {
	return id.slice(id.lastIndexOf("-") + 1);
}

/**
 * @param rows The signals of a single app (see `buildSignalRows`). Refused
 * signals are skipped: they belong to another app's graph.
 */
export function layoutSignalGraph(rows: SignalRow[]): SignalGraphLayout {
	const signals = rows.filter((row) => row.status !== "rejected");
	const byId = new Map(signals.map((row) => [row.id, row]));

	// Column of each signal. `visiting` breaks a cycle, which the signals
	// package cannot produce but a made-up graph could.
	const columns = new Map<string, number>();
	const visiting = new Set<string>();
	const columnOf = (row: SignalRow): number => {
		const known = columns.get(row.id);
		if (known !== undefined) return known;
		if (visiting.has(row.id)) return 0;
		visiting.add(row.id);

		let column = 0;
		for (const dep of row.deps) {
			const source = byId.get(dep);
			if (source) column = Math.max(column, columnOf(source) + 1);
		}

		visiting.delete(row.id);
		columns.set(row.id, column);
		return column;
	};

	const nodes: GraphNode[] = [];
	const edges: GraphEdge[] = [];
	const heights: number[] = [];
	const place = (column: number) => {
		const row = heights[column] ?? 0;
		heights[column] = row + 1;
		return row;
	};

	for (const row of signals) {
		const column = columnOf(row);
		nodes.push({
			id: row.id,
			kind: row.kind === "computed" ? "computed" : "signal",
			// What a signal holds says more than its generated id, so the value
			// leads and the id goes below. A worker-only signal has no value on
			// the page; its color and border already say so.
			...(row.status === "internal"
				? { label: row.kind === "computed" ? "computed" : "signal" }
				: {
						prefix: row.kind === "computed" ? "computed:" : "value:",
						label: formatValue(row.value, VALUE_LENGTH),
					}),
			detail: shortSignalId(row.id),
			column,
			row: place(column),
			signalId: row.id,
			internal: row.status === "internal",
			problem: row.problems.length > 0,
		});
		for (const dep of row.deps) {
			if (byId.has(dep)) edges.push({ from: dep, to: row.id });
		}
	}

	const last = Math.max(0, ...columns.values()) + 1;

	const effects = new Map<string, NubeSDKSignalGraphEffect>();
	for (const row of signals) {
		for (const effect of row.effects) effects.set(effect.id, effect);
	}
	for (const effect of effects.values()) {
		nodes.push({
			id: effect.id,
			kind: "effect",
			label: "effect",
			detail: shortSignalId(effect.id),
			column: last,
			row: place(last),
		});
		for (const dep of new Set(effect.deps)) {
			if (byId.has(dep)) edges.push({ from: dep, to: effect.id });
		}
	}

	// A signal in a repeatable slot is bound once per entry: the spots that
	// read alike (same signal, component and role) share one node.
	for (const row of signals) {
		const uses = new Map<
			string,
			{ label: string; role: string; count: number; inactive: boolean }
		>();
		for (const binding of row.bindings) {
			const role =
				binding.role === "prop" ? `${binding.prop}` : ROLE_DETAIL[binding.role];
			const key = `${binding.component}:${role}`;
			const use = uses.get(key);
			if (use) {
				use.count++;
				use.inactive &&= binding.inactive;
			} else {
				uses.set(key, {
					label: binding.component,
					role,
					count: 1,
					inactive: binding.inactive,
				});
			}
		}

		for (const [key, use] of uses) {
			const id = `use:${row.id}:${key}`;
			nodes.push({
				id,
				kind: "use",
				label: use.label,
				detail: use.count > 1 ? `${use.role} ×${use.count}` : use.role,
				column: last,
				row: place(last),
				signalId: row.id,
				inactive: use.inactive,
			});
			edges.push({ from: row.id, to: id });
		}
	}

	return {
		nodes,
		edges,
		columns: heights.length,
		rows: Math.max(0, ...heights.filter((height) => height !== undefined)),
	};
}

/**
 * The node `id`, everything it derives from and everything derived from it:
 * what to keep lit when the node is selected.
 */
export function connectedNodeIds(edges: GraphEdge[], id: string): Set<string> {
	const connected = new Set([id]);

	const walk = (start: string, next: (edge: GraphEdge) => [string, string]) => {
		const queue = [start];
		const seen = new Set([start]);
		while (queue.length > 0) {
			const current = queue.pop() as string;
			for (const edge of edges) {
				const [here, there] = next(edge);
				if (here !== current || seen.has(there)) continue;
				seen.add(there);
				connected.add(there);
				queue.push(there);
			}
		}
	};

	walk(id, (edge) => [edge.to, edge.from]); // upstream
	walk(id, (edge) => [edge.from, edge.to]); // downstream
	return connected;
}
