import type { JsonValue } from "./components";

/**
 * A signal created with `@tiendanube/nube-sdk-signals`, as it travels inside a
 * component tree.
 *
 * Passing the signal itself to a component, instead of its `value`, binds that
 * spot of the page to the signal: the platform renders it as a view that
 * listens to the signal, and every change made in the app updates only that
 * view, without rendering the slot again.
 *
 * ```tsx
 * const count = signal(0);
 *
 * nube.render("after_line_items", <Text>{count}</Text>);
 *
 * count.value = 1; // the text on the page becomes "1"
 * ```
 *
 * In the tree a signal is serialized as
 * `{ "type": "signal", "__internalId": "<id>", "initialValue": <value> }`,
 * where `initialValue` is the value at the time the tree is sent.
 */
export type NubeSignalReference<T = unknown> = {
	readonly type: "signal";
	/** Id of the signal, unique within the app. */
	readonly __internalId: string;
	/** Current value of the signal, read when the tree is serialized. */
	readonly initialValue: T;
};

/**
 * A value a signal can hold and share with the platform: anything that
 * survives `JSON.stringify`.
 */
export type NubeSignalValue = JsonValue | undefined;

/**
 * A signal that can be rendered as text: its value is converted with
 * `String()`, and `null` or `undefined` render nothing.
 */
export type NubeSignalTextReference = NubeSignalReference<NubeSignalText>;

/**
 * Values a signal rendered as text can hold.
 */
export type NubeSignalText = string | number | boolean | null | undefined;

/**
 * Events exchanged between the worker and the platform to keep signals in
 * sync.
 *
 * - `internal:signals:sync` — from the app: new values of signals changed
 *   after they were sent in a tree, batched per microtask;
 * - `internal:signals:update` — from the platform: new values for signals
 *   the app created, such as the value of a bound field.
 *
 * Messages keep their order, and a tree carries the values of the moment it
 * was sent. So the platform takes `initialValue` from each tree it receives
 * and then every later sync, keyed by `__internalId`.
 */
export type NubeSignalsEvent =
	| "internal:signals:sync"
	| "internal:signals:update";

/**
 * One signal value in a sync or update event.
 */
export type NubeSignalEntry = {
	/** The `__internalId` of the signal. */
	id: string;
	value: NubeSignalValue;
};

/**
 * Data of the `internal:signals:sync` and `internal:signals:update` events.
 *
 * Like every internal event, the message carries the `app` id next to `type`
 * and `data`. The platform only applies a value when the `__internalId` of the
 * signal belongs to that app.
 */
export type NubeSignalsEventData = {
	entries: NubeSignalEntry[];
};
