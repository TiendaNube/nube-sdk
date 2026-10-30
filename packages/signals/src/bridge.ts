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
 *   batched in one message per microtask;
 * - `internal:signals:update` (main → worker): new values the platform sets on
 *   signals of the app, for example the value of a bound field. They are
 *   applied in a single batch and are not sent back.
 *
 * Messages are JSON strings with the app id, like every other internal
 * message of the SDK: the platform drops any message whose `app` is not the
 * one of the worker it came from, and only applies values to signals whose
 * `__internalId` belongs to that app.
 */

import type {
	NubeSDK,
	NubeSignalEntry,
	NubeSignalsEvent,
	NubeSignalsEventData,
} from "@tiendanube/nube-sdk-types";
import {
	type SignalNode,
	batch,
	computed,
	effect,
	setCoreHooks,
	signal,
} from "./core";

const SYNC_EVENT: NubeSignalsEvent = "internal:signals:sync";
const UPDATE_EVENT: NubeSignalsEvent = "internal:signals:update";

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

function scope(): WorkerScope | undefined {
	return typeof self !== "undefined"
		? (self as unknown as WorkerScope)
		: undefined;
}

function appId(): string | undefined {
	return typeof self !== "undefined" ? self.__APP_DATA__?.id : undefined;
}

function queue(node: SignalNode<unknown>): void {
	if (!instance) return;
	pending.add(node);
	if (scheduled) return;
	scheduled = true;
	queueMicrotask(flushPending);
}

function flushPending(): void {
	scheduled = false;
	const entries: NubeSignalEntry[] = [];
	for (const node of pending) {
		if (live.has(node.__internalId)) {
			entries.push({
				id: node.__internalId,
				value: node.value as NubeSignalEntry["value"],
			});
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

function handleMessage(event: MessageEvent): void {
	if (typeof event.data !== "string") return;
	let message: unknown;
	try {
		message = JSON.parse(event.data);
	} catch {
		return;
	}
	if (!isUpdate(message)) return;

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
	},
	onChange: queue,
	onDispose(node) {
		live.delete(node.__internalId);
		pending.delete(node);
	},
});

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

	const target = scope();
	if (!listening && target) {
		target.addEventListener("message", handleMessage);
		listening = true;
	}
	return { signal, computed, effect, batch };
}
