/**
 * Turns the slot trees read from the page (see `readComponents`) into the
 * nodes the Components page renders.
 *
 * Unlike a framework devtools, there is no instance tree to walk: an app's UI
 * already is a serializable tree of `{ type, children, __internalId }`
 * objects. What this module does is make its three storage shapes (a single
 * component, an array, a repeatable slot's keyed record) and the register's
 * merge wrappers look like one tree.
 */
import type { NubeSDKComponentsSnapshot } from "../background/scripts/page-components";
import {
	type ConditionOutcome,
	IS_TRUE,
	explainCondition,
	formatValue,
} from "./conditions";

/** `"page"` is the merged tree the slots render; anything else is an app id. */
export const PAGE_VIEW = "page";

/**
 * - `signal`: a signal of the app used as a child, shown by its live value;
 * - `branch`: the `then` or `fallback` content of a `Show`, which has no node
 *   of its own in the app's tree.
 */
export type ComponentNodeKind =
	| "slot"
	| "component"
	| "text"
	| "signal"
	| "branch";

/** A signal as the page sees it right now. */
export type SignalState = {
	/** `signal-<appId>-<n>`. */
	id: string;
	/** What the page shows: the store's value, or `initialValue` without one. */
	value: unknown;
	/** The value the signal had when the tree was sent. */
	initialValue: unknown;
	/**
	 * Whether the page's store holds a value for it, i.e. the app changed it
	 * after rendering. Otherwise `value` is `initialValue`.
	 */
	synced: boolean;
};

/** A signal bound to a prop of a component. */
export type SignalProp = SignalState & { prop: string };

/** What a `Show` or a `Match.Value` decided for the current value. */
export type ControlFlowState = {
	kind: "show" | "match";
	/** The `when` / `of` signal. Missing when the app passed something else. */
	signal?: SignalState;
	/** `Show` only: its condition against the value. */
	outcome?: ConditionOutcome;
	/**
	 * Name of the branch the page mounts (`then`, `fallback`, `Match.When`,
	 * `Match.Default`), or `null` when it mounts nothing.
	 */
	active: string | null;
};

/** The state of one branch of a `Show` or of a `Match.Value`. */
export type BranchState = {
	/** Whether the page mounts this branch for the current value. */
	active: boolean;
	/** `Match.When` only: its condition against the value. */
	outcome?: ConditionOutcome;
};

export type ComponentNode = {
	/** Unique within the tree: the node's path. React key and selection id. */
	key: string;
	kind: ComponentNodeKind;
	/** Display name: `Text`, `Form.Field`, the slot id, the text itself... */
	name: string;
	/** Component type, as the SDK knows it (`txt`, `formField`...). */
	type?: string;
	/**
	 * The component's `__internalId`, which is also the DOM id the SDK renders
	 * it with. For a slot, the id of its host element.
	 */
	id?: string;
	/** Slot the node belongs to. */
	slot: string;
	/** App that rendered the node. Unset on slots. */
	app?: string;
	/** Record key of a repeatable slot entry (usually a product id). */
	entryKey?: string;
	/** The `key` the app gave the component. */
	componentKey?: string;
	/** Every prop but `type`, `children` and `__internalId`. */
	props: Record<string, unknown>;
	children: ComponentNode[];
	/** Slot only: how many hosts the page mounts for it. */
	mounted?: number;
	/** Slot only: whether it is a repeatable (keyed record) slot. */
	repeatable?: boolean;
	/** Slot only: apps contributing to it. */
	apps?: string[];
	/** `signal` nodes: the signal behind the text. */
	signal?: SignalState;
	/** Signals bound to props of the component. */
	signalProps?: SignalProp[];
	/** `Show` and `Match.Value`: what they decided. */
	controlFlow?: ControlFlowState;
	/** `Show` branches, `Match.When` and `Match.Default`. */
	branch?: BranchState;
	/**
	 * The node sits in a branch the page does not mount: it is in the app's
	 * tree, but not on the page.
	 */
	inactive?: boolean;
};

type RawComponent = {
	type: string;
	children?: unknown;
	__internalId?: unknown;
	key?: unknown;
	[prop: string]: unknown;
};

type RawSignal = {
	type: "signal";
	__internalId: string;
	initialValue?: unknown;
};

/** A signal of an app, as it travels in a tree. */
function isSignal(value: unknown): value is RawSignal {
	return (
		typeof value === "object" &&
		value !== null &&
		(value as RawSignal).type === "signal" &&
		typeof (value as RawSignal).__internalId === "string"
	);
}

function isComponent(value: unknown): value is RawComponent {
	return (
		typeof value === "object" &&
		value !== null &&
		!Array.isArray(value) &&
		typeof (value as RawComponent).type === "string"
	);
}

/** A repeatable slot's content: `Record<entryKey, component>`. */
function isRecord(value: unknown): value is Record<string, unknown> {
	return (
		typeof value === "object" &&
		value !== null &&
		!Array.isArray(value) &&
		!isComponent(value)
	);
}

/** Types whose JSX name is not just the capitalized type. */
const COMPONENT_NAMES: Record<string, string> = {
	col: "Column",
	txt: "Text",
	txtarea: "Textarea",
	img: "Image",
	check: "Checkbox",
	numberfield: "NumberField",
	sidescroll: "SideScroll",
	videoStories: "VideoStories",
	matchValue: "Match.Value",
	matchWhen: "Match.When",
	matchDefault: "Match.Default",
};

/** `<namespace><Part>` types, rendered as `Namespace.Part` like in JSX. */
const NAMESPACES = [
	"accordion",
	"clipboard",
	"form",
	"popover",
	"svg",
	"table",
	"toast",
	"video",
];

const capitalize = (value: string) =>
	value.charAt(0).toUpperCase() + value.slice(1);

/**
 * The name a developer wrote in their JSX for a component `type`. Unknown
 * types fall back to the type itself, so a component newer than the
 * extension still shows up.
 */
export function componentName(type: string): string {
	const known = COMPONENT_NAMES[type];
	if (known) return known;

	for (const namespace of NAMESPACES) {
		const part = type.slice(namespace.length);
		if (type.startsWith(namespace) && /^[A-Z]/.test(part)) {
			return `${capitalize(namespace)}.${part}`;
		}
	}

	return capitalize(type);
}

/** Id of the element a `Slot` renders as its host. */
export const slotHostId = (slot: string) => `nube-sdk-slot-${slot}`;

function walkComponents(value: unknown, visit: (node: RawComponent) => void) {
	if (Array.isArray(value)) {
		for (const item of value) walkComponents(item, visit);
		return;
	}
	if (isComponent(value)) {
		visit(value);
		walkComponents(value.children, visit);
		// The other side of a `Show` travels in a prop.
		if (value.type === "show") walkComponents(value.fallback, visit);
		return;
	}
	if (isRecord(value)) {
		for (const item of Object.values(value)) walkComponents(item, visit);
	}
}

/**
 * Which app owns each `__internalId`, from the per-app trees. The merged tree
 * keeps the components' ids, so this is what attributes its nodes.
 */
function ownersOf(apps: NubeSDKComponentsSnapshot["apps"]) {
	const owners = new Map<string, string>();
	for (const [appId, slots] of Object.entries(apps)) {
		for (const content of Object.values(slots)) {
			walkComponents(content, (node) => {
				if (typeof node.__internalId === "string") {
					owners.set(node.__internalId, appId);
				}
			});
		}
	}
	return owners;
}

type BuildContext = {
	slot: string;
	owners: Map<string, string>;
	/** Set in an app's view, where every node belongs to that app. */
	app?: string;
	/** Whether merge wrappers are flattened (page view only). */
	flattenMerges: boolean;
	/** What the page's signal store holds (see `readComponents`). */
	signals: NonNullable<NubeSDKComponentsSnapshot["signals"]>;
};

/** Same rule as the platform: the store wins over `initialValue`. */
function signalState(raw: RawSignal, context: BuildContext): SignalState {
	const entry = Object.prototype.hasOwnProperty.call(
		context.signals,
		raw.__internalId,
	)
		? context.signals[raw.__internalId]
		: undefined;
	return {
		id: raw.__internalId,
		value: entry ? entry.value : raw.initialValue,
		initialValue: raw.initialValue,
		synced: entry !== undefined,
	};
}

/** Marks everything under a branch the page does not mount. */
function markInactive(nodes: ComponentNode[]) {
	for (const node of nodes) {
		node.inactive = true;
		markInactive(node.children);
	}
}

function branchNode(
	name: string,
	path: string,
	active: boolean,
	children: ComponentNode[],
	context: BuildContext,
	app: string | undefined,
): ComponentNode {
	if (!active) markInactive(children);
	return {
		key: path,
		kind: "branch",
		name,
		slot: context.slot,
		app,
		props: {},
		children,
		branch: { active },
	};
}

/**
 * The children of a `Match.Value`, with the case the page mounts marked:
 * the first `Match.When` whose condition matches, otherwise the first
 * `Match.Default`, wherever it is.
 */
function buildMatchChildren(
	children: unknown,
	path: string,
	context: BuildContext,
	inherited: { app?: string; entryKey?: string },
	signal: SignalState | undefined,
): { nodes: ComponentNode[]; active: string | null } {
	const nodes = buildNodes(children, path, context, inherited);

	let winner: ComponentNode | undefined;
	let fallback: ComponentNode | undefined;
	for (const node of nodes) {
		if (node.type === "matchWhen") {
			const outcome = explainCondition(node.props.condition, signal?.value);
			node.branch = { active: false, outcome };
			const { condition: _condition, ...props } = node.props;
			node.props = props;
			if (!winner && signal && outcome.matches) winner = node;
		} else if (node.type === "matchDefault") {
			node.branch = { active: false };
			fallback ??= node;
		}
	}

	const active = signal ? winner ?? fallback : undefined;
	for (const node of nodes) {
		if (node === active) (node.branch as BranchState).active = true;
		// Anything else is never rendered, a stray child included.
		else {
			node.inactive = true;
			markInactive(node.children);
		}
	}

	const outcome = active?.branch?.outcome;
	return {
		nodes,
		active: active
			? outcome
				? `${active.name} ${outcome.text}`
				: active.name
			: null,
	};
}

function textNode(
	value: string | number,
	path: string,
	slot: string,
	app: string | undefined,
): ComponentNode {
	return {
		key: path,
		kind: "text",
		name: String(value),
		slot,
		app,
		props: {},
		children: [],
	};
}

function buildNodes(
	value: unknown,
	path: string,
	context: BuildContext,
	inherited: { app?: string; entryKey?: string },
): ComponentNode[] {
	if (typeof value === "string" || typeof value === "number") {
		return [textNode(value, path, context.slot, inherited.app)];
	}

	if (Array.isArray(value)) {
		return value.flatMap((item, index) =>
			buildNodes(item, `${path}.${index}`, context, inherited),
		);
	}

	if (isSignal(value)) {
		const signal = signalState(value, context);
		return [
			{
				key: path,
				kind: "signal",
				name: formatValue(signal.value, 80),
				slot: context.slot,
				app: inherited.app,
				props: {},
				children: [],
				signal,
			},
		];
	}

	if (!isComponent(value)) return [];

	const { type, children, __internalId, key, ...props } = value;
	const id = typeof __internalId === "string" ? __internalId : undefined;

	// The register wraps what it merged (several apps sharing a slot, or an
	// app's array) in a `fragment` of its own, without an id. It is an
	// implementation detail: its children are shown in its place, each one
	// attributed to the app that sent it.
	if (context.flattenMerges && type === "fragment" && id === undefined) {
		return buildNodes(children, path, context, inherited);
	}

	const app = context.app ?? (id && context.owners.get(id)) ?? inherited.app;

	const node: ComponentNode = {
		key: path,
		kind: "component",
		name: componentName(type),
		type,
		id,
		slot: context.slot,
		app,
		entryKey: inherited.entryKey,
		componentKey:
			typeof key === "string" || typeof key === "number"
				? String(key)
				: undefined,
		props,
		children: [],
	};

	if (type === "show") {
		// The app's tree has no node for the two sides of a `Show`: `children`
		// and the `fallback` prop. They get one each here, so the one the page
		// does not mount can be told apart.
		const { when, condition, fallback, ...rest } = props;
		const signal = isSignal(when) ? signalState(when, context) : undefined;
		const outcome = explainCondition(
			condition === undefined ? IS_TRUE : condition,
			signal?.value,
		);
		const matches = signal !== undefined && outcome.matches;

		node.props = rest;
		node.children = [
			branchNode(
				"then",
				`${path}.then`,
				matches,
				buildNodes(children, `${path}.c`, context, { app }),
				context,
				app,
			),
		];
		if (fallback !== undefined) {
			node.children.push(
				branchNode(
					"fallback",
					`${path}.else`,
					signal !== undefined && !matches,
					buildNodes(fallback, `${path}.f`, context, { app }),
					context,
					app,
				),
			);
		}
		node.controlFlow = {
			kind: "show",
			signal,
			outcome,
			active: !signal
				? null
				: matches
					? "then"
					: fallback !== undefined
						? "fallback"
						: null,
		};
		return [node];
	}

	if (type === "matchValue") {
		const { of, ...rest } = props;
		const signal = isSignal(of) ? signalState(of, context) : undefined;
		const match = buildMatchChildren(
			children,
			`${path}.c`,
			context,
			{ app },
			signal,
		);

		node.props = rest;
		node.children = match.nodes;
		node.controlFlow = { kind: "match", signal, active: match.active };
		return [node];
	}

	const signalProps: SignalProp[] = [];
	for (const [prop, propValue] of Object.entries(props)) {
		if (isSignal(propValue)) {
			signalProps.push({ prop, ...signalState(propValue, context) });
		}
	}
	if (signalProps.length > 0) node.signalProps = signalProps;

	node.children = buildNodes(children, `${path}.c`, context, { app });
	return [node];
}

function collectApps(nodes: ComponentNode[], apps: Set<string>) {
	for (const node of nodes) {
		if (node.app) apps.add(node.app);
		collectApps(node.children, apps);
	}
}

/**
 * The slot nodes of one view: the merged page tree (`PAGE_VIEW`) or an app's
 * own tree. Slots are sorted by id so the list does not reshuffle as apps
 * render.
 */
export function buildComponentTree(
	snapshot: NubeSDKComponentsSnapshot,
	view: string,
): ComponentNode[] {
	const isPage = view === PAGE_VIEW;
	const slots = isPage ? snapshot.page : snapshot.apps[view] ?? {};
	const owners = ownersOf(snapshot.apps);

	return Object.keys(slots)
		.sort()
		.flatMap((slot) => {
			const content = slots[slot];
			const context: BuildContext = {
				slot,
				owners,
				app: isPage ? undefined : view,
				flattenMerges: isPage,
				signals: snapshot.signals ?? {},
			};
			const path = `${view}:${slot}`;

			const repeatable = isRecord(content);
			const children = repeatable
				? Object.entries(content).flatMap(([entryKey, item]) =>
						buildNodes(item, `${path}[${entryKey}]`, context, { entryKey }),
					)
				: buildNodes(content, path, context, {});

			if (children.length === 0) return [];

			const apps = new Set<string>();
			collectApps(children, apps);

			return [
				{
					key: path,
					kind: "slot" as const,
					name: slot,
					id: slotHostId(slot),
					slot,
					props: {},
					children,
					mounted: snapshot.mounted[slot] ?? 0,
					repeatable,
					apps: [...apps].sort(),
				},
			];
		});
}

/**
 * Ids to outline or scroll to for a node: its own, then its descendants' in
 * tree order. A component that renders no element of its own (a fragment, an
 * icon...) is found through its children this way.
 */
export function domIdsOf(node: ComponentNode): string[] {
	const ids: string[] = [];
	const visit = (current: ComponentNode) => {
		if (current.id) ids.push(current.id);
		for (const child of current.children) visit(child);
	};
	visit(node);
	return ids;
}

/** Depth-first search by `key`. */
export function findNode(
	nodes: ComponentNode[],
	key: string,
): ComponentNode | null {
	for (const node of nodes) {
		if (node.key === key) return node;
		const found = findNode(node.children, key);
		if (found) return found;
	}
	return null;
}

/**
 * Keys of the ancestors of the node `key`, outermost first, or `null` when
 * the node is not in `nodes`.
 */
export function ancestorKeys(
	nodes: ComponentNode[],
	key: string,
): string[] | null {
	for (const node of nodes) {
		if (node.key === key) return [];
		const inner = ancestorKeys(node.children, key);
		if (inner) return [node.key, ...inner];
	}
	return null;
}

/**
 * First node, in tree order, rendered with one of `domIds` — which are an
 * element's id and its ancestors', innermost first.
 */
export function nodeForDomIds(
	nodes: ComponentNode[],
	domIds: string[],
): ComponentNode | null {
	const byId = new Map<string, ComponentNode>();
	const visit = (current: ComponentNode) => {
		if (current.kind === "component" && current.id && !byId.has(current.id)) {
			byId.set(current.id, current);
		}
		for (const child of current.children) visit(child);
	};
	for (const node of nodes) visit(node);

	for (const id of domIds) {
		const found = byId.get(id);
		if (found) return found;
	}
	return null;
}

function matches(node: ComponentNode, query: string): boolean {
	return [
		node.name,
		node.type,
		node.id,
		node.app,
		node.entryKey,
		node.componentKey,
		node.signal?.id,
		node.controlFlow?.signal?.id,
		...(node.signalProps ?? []).map((signal) => signal.id),
	]
		.filter((value): value is string => typeof value === "string")
		.some((value) => value.toLowerCase().includes(query));
}

/**
 * Keeps the nodes matching `query` and the ancestors leading to them. A
 * matching node keeps its whole subtree, so what was found stays readable.
 */
export function filterTree(
	nodes: ComponentNode[],
	query: string,
): ComponentNode[] {
	const needle = query.trim().toLowerCase();
	if (!needle) return nodes;

	return nodes.flatMap((node) => {
		if (matches(node, needle)) return [node];
		const children = filterTree(node.children, needle);
		return children.length > 0 ? [{ ...node, children }] : [];
	});
}

/** Number of component nodes (text excluded) under `nodes`. */
export function countComponents(nodes: ComponentNode[]): number {
	return nodes.reduce(
		(total, node) =>
			total +
			(node.kind === "component" ? 1 : 0) +
			countComponents(node.children),
		0,
	);
}
