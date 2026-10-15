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

/** `"page"` is the merged tree the slots render; anything else is an app id. */
export const PAGE_VIEW = "page";

export type ComponentNodeKind = "slot" | "component" | "text";

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
};

type RawComponent = {
	type: string;
	children?: unknown;
	__internalId?: unknown;
	key?: unknown;
	[prop: string]: unknown;
};

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
};

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

	return [
		{
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
			children: buildNodes(children, `${path}.c`, context, {
				app,
			}),
		},
	];
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
