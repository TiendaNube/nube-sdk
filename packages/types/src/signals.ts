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
 *   the app created, such as the value of a bound field;
 * - `internal:signals:inspect` — from the platform, only when the NubeSDK
 *   DevTools is open: asks the app to describe its signals;
 * - `internal:signals:graph` — from the app, only after being asked: the
 *   signals, computed signals and effects of the app and how they depend on
 *   each other (see {@link NubeSignalsGraphEventData}). It carries no values.
 *
 * Messages keep their order, and a tree carries the values of the moment it
 * was sent. So the platform takes `initialValue` from each tree it receives
 * and then every later sync, keyed by `__internalId`.
 */
export type NubeSignalsEvent =
	| "internal:signals:sync"
	| "internal:signals:update"
	| "internal:signals:inspect"
	| "internal:signals:graph";

/**
 * One signal value in a sync or update event.
 */
export type NubeSignalEntry = {
	/** The `__internalId` of the signal. */
	id: string;
	/**
	 * The new value. Omitted when the value is `undefined`, since the event
	 * travels as JSON; a missing `value` means `undefined`.
	 */
	value?: NubeSignalValue;
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

/**
 * A signal or computed signal of an app, as described to the NubeSDK
 * DevTools.
 */
export type NubeSignalGraphNode = {
	/** The `__internalId` of the signal. */
	id: string;
	kind: "signal" | "computed";
	/** Whether the signal was ever passed to a component. */
	rendered: boolean;
	/** `computed` only: ids of the signals it derives from. */
	deps?: string[];
};

/**
 * An effect of an app, as described to the NubeSDK DevTools.
 */
export type NubeSignalGraphEffect = {
	/** `effect-<n>`, unique within the app. */
	id: string;
	/** Ids of the signals it depends on. */
	deps: string[];
};

/**
 * Data of the `internal:signals:graph` event: the reactive graph of an app,
 * without any value. Values only reach the page for signals passed to a
 * component, through the tree and `internal:signals:sync`.
 */
export type NubeSignalsGraphEventData = {
	/** Whether the app called `useSignals(nube)`. */
	connected: boolean;
	signals: NubeSignalGraphNode[];
	effects: NubeSignalGraphEffect[];
	/**
	 * Signals passed to a component and changed afterwards while the app was
	 * not connected, so the page never got the new value.
	 */
	unsynced: string[];
	/** Signals whose value could not be sent because it is not serializable. */
	unserializable: string[];
	/** The app has more signals or effects than a message carries. */
	truncated?: boolean;
};
