/**
 * @fileoverview Channel between the signals of an app and the platform.
 *
 * The app runs in a worker; the page lives on the main thread. A signal passed
 * to a component reaches the page inside the tree, as a
 * `{ type: "signal", __internalId, initialValue }` node the platform renders as
 * a view bound to it. Once the app calls {@link useSignals}, later changes
 * travel on two internal events:
 *
 * - `internal:signals:sync` (worker → main): new values of signals changed,
 *   batched in one message per microtask. Only signals that already reached a
 *   tree are sent: a signal used only inside the app (a store, a counter
 *   behind a computed label) never leaves the worker;
 * - `internal:signals:update` (main → worker): new values the platform sets on
 *   signals of the app, for example the value of a bound field. They are
 *   applied in a single batch and are not sent back.
 *
 * Two more exist only for the NubeSDK DevTools:
 *
 * - `internal:signals:inspect` (main → worker): sent when the DevTools is
 *   open. Until it arrives, nothing below is ever sent;
 * - `internal:signals:graph` (worker → main): the signals, computed signals
 *   and effects of the app, their dependencies, and what is keeping
 *   a signal from reaching the page. It carries no values.
 *
 * Messages are JSON strings with the app id, like every other internal
 * message of the SDK: the platform drops any message whose `app` is not the
 * one of the worker it came from, and only applies values to signals whose
 * `__internalId` belongs to that app.
 */

import type {
	NubeSDK,
	NubeSignalEntry,
	NubeSignalGraphEffect,
	NubeSignalGraphNode,
	NubeSignalsEvent,
	NubeSignalsEventData,
	NubeSignalsGraphEventData,
} from "@tiendanube/nube-sdk-types";
import {
	type EffectInfo,
	type SignalNode,
	batch,
	computed,
	effect,
	setCoreHooks,
	signal,
} from "./core";

const SYNC_EVENT: NubeSignalsEvent = "internal:signals:sync";
const UPDATE_EVENT: NubeSignalsEvent = "internal:signals:update";
const INSPECT_EVENT: NubeSignalsEvent = "internal:signals:inspect";
const GRAPH_EVENT: NubeSignalsEvent = "internal:signals:graph";

/** Most signals and effects described in one graph message. */
const MAX_GRAPH_NODES = 500;

type WorkerScope = {
	postMessage(message: string): void;
	addEventListener(
		type: "message",
		listener: (event: MessageEvent) => void,
	): void;
};

let instance: Readonly<NubeSDK> | undefined;
let listening = false;
let scheduled = false;
const live = new Map<string, SignalNode<unknown>>();
const pending = new Set<SignalNode<unknown>>();
/** Signals serialized into a tree at least once: the only ones the page shows. */
const rendered = new Set<SignalNode<unknown>>();

/** Effects alive, for the DevTools. */
const effects = new Set<EffectInfo>();
/** Whether the DevTools asked for the graph. Nothing is sent before that. */
let inspected = false;
let graphScheduled = false;
/** Rendered signals changed while `useSignals` had not been called. */
const unsynced = new Set<string>();
/** Signals whose last value could not be serialized. */
const unserializable = new Set<string>();

function scope(): WorkerScope | undefined {
	return typeof self !== "undefined"
		? (self as unknown as WorkerScope)
		: undefined;
}

function appId(): string | undefined {
	return typeof self !== "undefined" ? self.__APP_DATA__?.id : undefined;
}

/**
 * Describes the signals of the app to the DevTools: structure only, never
 * values. Batched per microtask, like value changes.
 */
function scheduleGraph(): void {
	if (!inspected || graphScheduled) return;
	graphScheduled = true;
	queueMicrotask(sendGraph);
}

function sendGraph(): void {
	graphScheduled = false;

	const signals: NubeSignalGraphNode[] = [];
	for (const node of live.values()) {
		if (signals.length >= MAX_GRAPH_NODES) break;
		const entry: NubeSignalGraphNode = {
			id: node.__internalId,
			kind: node.readonly ? "computed" : "signal",
			rendered: rendered.has(node),
		};
		if (node.readonly) entry.deps = [...node.sources];
		signals.push(entry);
	}

	const effectList: NubeSignalGraphEffect[] = [];
	for (const info of effects) {
		if (effectList.length >= MAX_GRAPH_NODES) break;
		effectList.push({
			id: `effect-${info.seq.toString(36)}`,
			deps: [...info.deps],
		});
	}

	const data: NubeSignalsGraphEventData = {
		connected: instance !== undefined,
		signals,
		effects: effectList,
		unsynced: [...unsynced],
		unserializable: [...unserializable],
	};
	if (live.size > signals.length || effects.size > effectList.length) {
		data.truncated = true;
	}

	try {
		scope()?.postMessage(
			JSON.stringify({ app: appId(), type: GRAPH_EVENT, data }),
		);
	} catch {
		// Debugging aid only: never let it break the app.
	}
}

function queue(node: SignalNode<unknown>): void {
	if (!instance) {
		// The page shows this signal, and will never hear about this change.
		if (rendered.has(node) && !unsynced.has(node.__internalId)) {
			unsynced.add(node.__internalId);
			scheduleGraph();
		}
		return;
	}
	if (!rendered.has(node)) return;
	pending.add(node);
	if (scheduled) return;
	scheduled = true;
	queueMicrotask(flushPending);
}

function flushPending(): void {
	scheduled = false;
	const entries: NubeSignalEntry[] = [];
	for (const node of pending) {
		if (!live.has(node.__internalId)) continue;
		const entry: NubeSignalEntry = {
			id: node.__internalId,
			value: node.value as NubeSignalEntry["value"],
		};
		// Checked one by one, so a value that cannot be serialized only drops
		// its own signal, not the others changed in the same microtask.
		try {
			JSON.stringify(entry);
			entries.push(entry);
			if (unserializable.delete(entry.id)) scheduleGraph();
		} catch (error) {
			if (!unserializable.has(entry.id)) {
				unserializable.add(entry.id);
				scheduleGraph();
			}
			console.error(
				`[nube-sdk-signals] The value of signal "${entry.id}" cannot be serialized:`,
				error,
			);
		}
	}
	pending.clear();
	if (entries.length === 0) return;

	const data: NubeSignalsEventData = { entries };
	let message: string;
	try {
		message = JSON.stringify({ app: appId(), type: SYNC_EVENT, data });
	} catch (error) {
		console.error(
			"[nube-sdk-signals] A signal value cannot be serialized:",
			error,
		);
		return;
	}
	scope()?.postMessage(message);
}

function isUpdate(message: unknown): message is { data: NubeSignalsEventData } {
	if (typeof message !== "object" || message === null) return false;
	const { type, data } = message as {
		type?: unknown;
		data?: { entries?: unknown };
	};
	return type === UPDATE_EVENT && Array.isArray(data?.entries);
}

function isInspect(message: unknown): boolean {
	return (
		typeof message === "object" &&
		message !== null &&
		(message as { type?: unknown }).type === INSPECT_EVENT
	);
}

function handleMessage(event: MessageEvent): void {
	if (typeof event.data !== "string") return;
	let message: unknown;
	try {
		message = JSON.parse(event.data);
	} catch {
		return;
	}

	if (isInspect(message)) {
		inspected = true;
		scheduleGraph();
		return;
	}

	// Values from the platform only apply once the app connected its signals.
	if (!instance || !isUpdate(message)) return;

	batch(() => {
		for (const entry of message.data.entries) {
			const node = live.get(entry?.id);
			// Computed signals are derived in the app; the platform cannot set them.
			if (node && !node.readonly) node.write(entry.value, false);
		}
	});
}

setCoreHooks({
	onCreate(node) {
		// Not sent: the tree carries the value of the signal when it is rendered.
		live.set(node.__internalId, node);
		scheduleGraph();
	},
	onRender(node) {
		// Changes before this point need no message: the tree carries the value.
		if (rendered.has(node)) return;
		rendered.add(node);
		scheduleGraph();
	},
	onChange: queue,
	onDispose(node) {
		live.delete(node.__internalId);
		pending.delete(node);
		rendered.delete(node);
		unsynced.delete(node.__internalId);
		unserializable.delete(node.__internalId);
		scheduleGraph();
	},
	onEffectCreate(info) {
		effects.add(info);
		scheduleGraph();
	},
	onEffectDispose(info) {
		effects.delete(info);
		scheduleGraph();
	},
});

/**
 * Listens to the platform. Done when the package loads, not in `useSignals`,
 * so the DevTools can describe the signals of an app that forgot to call it,
 * which is the first thing worth finding out.
 */
function listen(): void {
	const target = scope();
	if (listening || typeof target?.addEventListener !== "function") return;
	target.addEventListener("message", handleMessage);
	listening = true;
}

listen();

/**
 * Connects the signals of the app to the platform, so signals passed to
 * components are kept in sync on the page.
 *
 * Call it once, at the start of the `App(nube)` entry point. Without it,
 * signals still work inside the app and a rendered signal shows the value it
 * had when rendered, but later changes never reach the page.
 *
 * @param nube - The NubeSDK instance received by `App(nube)`.
 * @returns The signal functions, for apps that prefer to take them from here.
 *
 * @example
 * ```tsx
 * import { signal, useSignals } from "@tiendanube/nube-sdk-signals";
 *
 * const count = signal(0);
 *
 * export function App(nube: NubeSDK) {
 *   useSignals(nube);
 *
 *   nube.render("after_line_items", <Text>{count}</Text>);
 *   nube.on("cart:update", ({ cart }) => {
 *     count.value = cart.items.length;
 *   });
 * }
 * ```
 */
export function useSignals(nube: Readonly<NubeSDK>) {
	if (typeof nube !== "object" || nube === null) {
		throw new TypeError(
			"[nube-sdk-signals] useSignals(nube) needs the NubeSDK instance received by App(nube).",
		);
	}
	instance = nube;
	listen();
	scheduleGraph();
	return { signal, computed, effect, batch };
}
