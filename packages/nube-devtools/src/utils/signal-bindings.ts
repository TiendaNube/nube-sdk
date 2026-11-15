/**
 * Where each signal is used on the page, and the list the Signals page
 * shows.
 *
 * A signal lives in the app's worker; what the page knows about it is where
 * it sits in the component trees and the values the app synced. Both are
 * already in the panel (the component tree and the hook's signal records),
 * so this module only joins them.
 */
import {
	type ComponentNode,
	type SignalState,
	domIdsOf,
} from "./component-tree";

/**
 * - `text`: the signal is a child, rendered as text;
 * - `prop`: it is the value of a prop;
 * - `show`: it is the `when` of a `Show`;
 * - `match`: it is the `of` of a `Match.Value`.
 */
export type SignalRole = "text" | "prop" | "show" | "match";

/** One place of the page bound to a signal. */
export type SignalBinding = {
	signalId: string;
	role: SignalRole;
	/** `prop` role: which prop. */
	prop?: string;
	/** Key of the node to select on the Components page. */
	nodeKey: string;
	/** JSX name of the component the signal is bound to. */
	component: string;
	/** Ids to outline on the page (see `domIdsOf`). */
	domIds: string[];
	slot: string;
	app?: string;
	/** Record key of a repeatable slot entry. */
	entryKey?: string;
	/** `show` and `match`: the branch the page mounts, or `null` for none. */
	active?: string | null;
	/** The binding sits in a branch the page does not mount. */
	inactive: boolean;
	/** The signal as that place of the tree carries it. */
	state: SignalState;
};

/**
 * Every binding of the page tree, grouped by signal id, in tree order.
 *
 * @param tree The nodes of the page view (see `buildComponentTree`).
 */
export function collectSignalBindings(
	tree: ComponentNode[],
): Map<string, SignalBinding[]> {
	const bindings = new Map<string, SignalBinding[]>();

	const add = (binding: SignalBinding) => {
		const list = bindings.get(binding.signalId);
		if (list) list.push(binding);
		else bindings.set(binding.signalId, [binding]);
	};

	const visit = (
		node: ComponentNode,
		parent: ComponentNode | undefined,
		entryKey: string | undefined,
	) => {
		const entry = node.entryKey ?? entryKey;
		const base = {
			slot: node.slot,
			app: node.app,
			entryKey: entry,
			inactive: node.inactive === true,
		};

		if (node.kind === "signal" && node.signal) {
			// The text has no element of its own: it is found through the
			// component it is a child of.
			const owner = parent && parent.kind !== "branch" ? parent : undefined;
			add({
				...base,
				signalId: node.signal.id,
				role: "text",
				nodeKey: node.key,
				component: owner?.name ?? node.slot,
				domIds: owner ? domIdsOf(owner) : [],
				state: node.signal,
			});
		}

		for (const signal of node.signalProps ?? []) {
			const { prop, ...state } = signal;
			add({
				...base,
				signalId: signal.id,
				role: "prop",
				prop,
				nodeKey: node.key,
				component: node.name,
				domIds: domIdsOf(node),
				state,
			});
		}

		if (node.controlFlow?.signal) {
			add({
				...base,
				signalId: node.controlFlow.signal.id,
				role: node.controlFlow.kind,
				nodeKey: node.key,
				component: node.name,
				domIds: domIdsOf(node),
				active: node.controlFlow.active,
				state: node.controlFlow.signal,
			});
		}

		for (const child of node.children) visit(child, node, entry);
	};

	for (const node of tree) visit(node, undefined, undefined);
	return bindings;
}

/**
 * - `synced`: the app changed it after rendering, and the page has the value;
 * - `initial`: it still shows the value it was rendered with;
 * - `orphan`: the page holds a value for it, but no tree uses it anymore;
 * - `rejected`: an app sent a value for a signal it does not own, and the
 *   platform refused it;
 * - `internal`: the app has it, but never passed it to a component, so it
 *   never left the app's worker and the page has no value for it. Only known
 *   from the graph the app describes.
 */
export type SignalStatus =
	| "synced"
	| "initial"
	| "orphan"
	| "rejected"
	| "internal";

/**
 * What keeps the page from following a signal:
 *
 * - `unsynced`: it changed after being rendered, but the app never called
 *   `useSignals(nube)`, so the page still shows the old value;
 * - `unserializable`: its value cannot be turned into JSON, so it was not
 *   sent.
 */
export type SignalProblem = "unsynced" | "unserializable";

/** One value an app synced for a signal. */
export type SignalChange = {
	/** `seq` of the record (the sync message) it came in. */
	seq: number;
	timestamp: number;
	value: unknown;
	prev: unknown;
	/** Whether the page had a value before; otherwise `prev` is meaningless. */
	hadPrev: boolean;
	/** How many signals changed in the same message (a `batch` in the app). */
	batchSize: number;
};

export type SignalRow = {
	id: string;
	/** App that owns the signal (for `rejected`, the app that sent it). */
	app: string;
	status: SignalStatus;
	/** What the page shows. Meaningless for `rejected`. */
	value: unknown;
	/** The value it was rendered with, when a tree uses it. */
	initialValue?: unknown;
	bindings: SignalBinding[];
	/** Synced values still in the history, oldest first. */
	changes: SignalChange[];
	/** Timestamp of the last change, or `0`. */
	lastChange: number;
	/** From the app's graph. Unknown without one. */
	kind?: "signal" | "computed";
	/** `computed`: ids of the signals it derives from. */
	deps: string[];
	/** Ids of the computed signals derived from it. */
	dependents: string[];
	/** Effects that depend on it. */
	effects: NubeSDKSignalGraphEffect[];
	problems: SignalProblem[];
};

/** Creation order of a signal: its id ends in a base-36 counter. */
function orderOf(id: string): number {
	const order = Number.parseInt(id.slice(id.lastIndexOf("-") + 1), 36);
	return Number.isNaN(order) ? 0 : order;
}

/** `signal-<appId>-<n>`: the app id is everything between the two ends. */
export function appOfSignal(id: string): string {
	return /^signal-(.+)-[^-]+$/.exec(id)?.[1] ?? "unknown";
}

/**
 * The signals the page knows about: every one in the trees, plus every one
 * an app synced or tried to, plus (when the apps described their graph) the
 * ones that never left the worker. Sorted by app, then by creation order.
 */
export function buildSignalRows(
	bindings: Map<string, SignalBinding[]>,
	records: NubeSDKDevtoolsSignalsRecord[],
	graphs: NubeSDKDevtoolsSignalGraph[] = [],
): SignalRow[] {
	const rows = new Map<string, SignalRow>();
	const graphFields = () => ({
		deps: [] as string[],
		dependents: [] as string[],
		effects: [] as NubeSDKSignalGraphEffect[],
		problems: [] as SignalProblem[],
	});

	for (const [id, list] of bindings) {
		const { state } = list[0];
		rows.set(id, {
			id,
			app: list.find((binding) => binding.app)?.app ?? appOfSignal(id),
			status: state.synced ? "synced" : "initial",
			value: state.value,
			initialValue: state.initialValue,
			bindings: list,
			changes: [],
			lastChange: 0,
			...graphFields(),
		});
	}

	for (const record of records) {
		for (const change of record.changes) {
			let row = rows.get(change.id);
			if (!row) {
				row = {
					id: change.id,
					app: record.app,
					status: "orphan",
					value: undefined,
					bindings: [],
					changes: [],
					lastChange: 0,
					...graphFields(),
				};
				rows.set(change.id, row);
			}
			row.changes.push({
				seq: record.seq,
				timestamp: record.timestamp,
				value: change.value,
				prev: change.prev,
				hadPrev: change.hadPrev,
				batchSize: record.changes.length,
			});
			// The records are live; the tree snapshot trails them by a moment.
			row.value = change.value;
			row.lastChange = record.timestamp;
			if (row.status === "initial") row.status = "synced";
		}

		for (const id of record.rejected) {
			if (rows.has(id)) continue;
			rows.set(id, {
				id,
				app: record.app,
				status: "rejected",
				value: undefined,
				bindings: [],
				changes: [],
				lastChange: record.timestamp,
				...graphFields(),
			});
		}
	}

	for (const graph of graphs) {
		for (const node of graph.signals) {
			let row = rows.get(node.id);
			if (!row) {
				row = {
					id: node.id,
					app: graph.app,
					status: "internal",
					value: undefined,
					bindings: [],
					changes: [],
					lastChange: 0,
					...graphFields(),
				};
				rows.set(node.id, row);
			}
			// A refused signal belongs to another app: this one cannot describe it.
			if (row.status === "rejected") continue;
			row.kind = node.kind;
			row.deps = node.deps ?? [];
		}

		for (const node of graph.signals) {
			for (const dep of node.deps ?? []) {
				rows.get(dep)?.dependents.push(node.id);
			}
		}
		for (const effect of graph.effects) {
			for (const dep of new Set(effect.deps)) {
				rows.get(dep)?.effects.push(effect);
			}
		}
		for (const id of graph.unsynced) {
			rows.get(id)?.problems.push("unsynced");
		}
		for (const id of graph.unserializable) {
			rows.get(id)?.problems.push("unserializable");
		}
	}

	return [...rows.values()].sort(
		(a, b) =>
			a.app.localeCompare(b.app) ||
			orderOf(a.id) - orderOf(b.id) ||
			a.id.localeCompare(b.id),
	);
}
