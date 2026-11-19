/**
 * @fileoverview Reactive core: signals, computed signals, effects and batches.
 *
 * Dependencies are explicit: `computed` and `effect` receive the signals they
 * read. Because a dependency must exist before what depends on it, the order
 * in which nodes are created is a valid topological order of the graph. The
 * scheduler relies on that to run every computed and effect at most once per
 * flush, after all of its dependencies settled, so none of them ever sees a
 * half-updated graph.
 */

import type { NubeSignalReference } from "@tiendanube/nube-sdk-types";

/**
 * A function called with the new value of a signal whenever it changes.
 */
export type Subscriber<T> = (value: T) => void;

/**
 * A reactive value. Reading `value` returns the current value; assigning it
 * notifies everything that depends on the signal.
 *
 * A signal is also a {@link NubeSignalReference}: pass it to a component to
 * bind that spot of the page to its value.
 */
export type Signal<T> = NubeSignalReference<T> & {
	value: T;
	/**
	 * Calls `fn` with the new value whenever the signal changes.
	 * @returns A function that stops the subscription.
	 */
	subscribe(fn: Subscriber<T>): () => void;
};

/**
 * A signal whose value cannot be assigned, such as a computed signal.
 */
export type ReadonlySignal<T> = Omit<Signal<T>, "value"> & {
	readonly value: T;
};

/**
 * A signal derived from other signals.
 */
export type Computed<T> = ReadonlySignal<T> & {
	/**
	 * Stops following the dependencies. The value stays as it was.
	 */
	dispose(): void;
};

/**
 * Any signal, writable or not, accepted as a dependency.
 */
export type AnySignal = ReadonlySignal<unknown>;

/**
 * Runs again when a dependency changes. If it returns a function, that
 * function is the cleanup, called before the next run and when the effect is
 * disposed; any other return value is ignored.
 */
export type EffectCallback = () => unknown;

/** Limit of runs in a single flush, to stop effects that feed each other. */
const MAX_RUNS_PER_FLUSH = 10_000;

type Node = {
	readonly seq: number;
	run(): void;
};

/** Hooks the core calls so the bridge can share values with the platform. */
export type CoreHooks = {
	onCreate(node: SignalNode<unknown>): void;
	/** The node was serialized or copied into a component tree. */
	onRender(node: SignalNode<unknown>): void;
	onChange(node: SignalNode<unknown>): void;
	onDispose(node: SignalNode<unknown>): void;
};

let hooks: CoreHooks | undefined;

/** Installs the hooks of the bridge. Internal to the package. */
export function setCoreHooks(next: CoreHooks | undefined): void {
	hooks = next;
}

let sequence = 0;
let batchDepth = 0;
let flushing = false;
const dirty = new Set<Node>();
const toNotify = new Set<SignalNode<unknown>>();

function report(message: string, error: unknown): void {
	console.error(`[nube-sdk-signals] ${message}`, error);
}

function nextDirty(): Node {
	let next: Node | undefined;
	for (const node of dirty) {
		if (!next || node.seq < next.seq) next = node;
	}
	dirty.delete(next as Node);
	return next as Node;
}

function flush(): void {
	if (flushing || batchDepth > 0) return;
	flushing = true;
	let runs = 0;
	try {
		while (toNotify.size > 0 || dirty.size > 0) {
			if (++runs > MAX_RUNS_PER_FLUSH) {
				report(
					"Too many updates in a row; an effect probably writes to a signal it depends on.",
					undefined,
				);
				dirty.clear();
				toNotify.clear();
				break;
			}
			// Subscribers of a changed signal first, then the dependent node
			// created earliest: all of its dependencies have settled by then.
			const [changed] = toNotify;
			if (changed) {
				toNotify.delete(changed);
				changed.notifySubscribers();
				continue;
			}
			nextDirty().run();
		}
	} finally {
		flushing = false;
	}
}

/**
 * Builds the id of a signal in the same `{type}-{appId}-{hash}` format as the
 * ids of components, so the platform can tell which app owns it.
 */
function createSignalId(seq: number): string {
	const appId = typeof self !== "undefined" ? self.__APP_DATA__?.id : undefined;
	return `signal-${appId ?? "app"}-${seq.toString(36)}`;
}

/**
 * Internal node behind `signal()` and `computed()`.
 *
 * Its only own enumerable properties are `type`, `__internalId` and
 * `initialValue`, the last one a getter of the current value. So copying or
 * serializing the node — as the SDK does with the component tree — yields the
 * plain `{ type: "signal", __internalId, initialValue }` node the platform
 * renders as a view bound to the signal. Reading `initialValue` is also how
 * the bridge learns that the signal reached a tree.
 */
export class SignalNode<T> implements Signal<T> {
	declare readonly type: "signal";
	declare readonly __internalId: string;
	declare readonly initialValue: T;
	readonly #seq: number;
	readonly #readonly: boolean;
	#value: T;
	readonly #subscribers = new Set<Subscriber<T>>();
	readonly #dependents = new Set<Node>();

	constructor(value: T, readonly = false) {
		this.#seq = ++sequence;
		this.#value = value;
		this.#readonly = readonly;
		Object.defineProperties(this, {
			type: { value: "signal", enumerable: true },
			__internalId: { value: createSignalId(this.#seq), enumerable: true },
			initialValue: {
				get: () => {
					hooks?.onRender(this as SignalNode<unknown>);
					return this.#value;
				},
				enumerable: true,
			},
		});
		hooks?.onCreate(this as SignalNode<unknown>);
	}

	get seq(): number {
		return this.#seq;
	}

	get readonly(): boolean {
		return this.#readonly;
	}

	get value(): T {
		return this.#value;
	}

	set value(next: T) {
		if (this.#readonly) {
			console.warn(
				"[nube-sdk-signals] A computed signal cannot be assigned; ignoring.",
			);
			return;
		}
		this.write(next);
	}

	/**
	 * Sets the value, bypassing the readonly guard. Returns whether it
	 * changed. `local` is false for values that came from the platform, which
	 * must not be sent back to it.
	 */
	write(next: T, local = true): boolean {
		if (Object.is(next, this.#value)) return false;
		this.#value = next;
		if (local) hooks?.onChange(this as SignalNode<unknown>);
		toNotify.add(this as SignalNode<unknown>);
		for (const dependent of this.#dependents) dirty.add(dependent);
		flush();
		return true;
	}

	subscribe(fn: Subscriber<T>): () => void {
		// Wrapped so the same function can be subscribed more than once.
		const subscriber: Subscriber<T> = (value) => fn(value);
		this.#subscribers.add(subscriber);
		return () => {
			this.#subscribers.delete(subscriber);
		};
	}

	notifySubscribers(): void {
		const value = this.#value;
		for (const subscriber of [...this.#subscribers]) {
			try {
				subscriber(value);
			} catch (error) {
				report("Error in a signal subscriber:", error);
			}
		}
	}

	addDependent(node: Node): void {
		this.#dependents.add(node);
	}

	removeDependent(node: Node): void {
		this.#dependents.delete(node);
		dirty.delete(node);
	}

	toString(): string {
		return String(this.#value);
	}
}

function asNode(dep: AnySignal): SignalNode<unknown> {
	if (!(dep instanceof SignalNode)) {
		throw new TypeError(
			"[nube-sdk-signals] Dependencies must be signals created by signal() or computed().",
		);
	}
	return dep;
}

function readDeps(deps: readonly AnySignal[] | undefined, name: string) {
	if (!Array.isArray(deps) || deps.length === 0) {
		throw new TypeError(
			`[nube-sdk-signals] ${name} needs at least one dependency.`,
		);
	}
	return deps.map(asNode);
}

/**
 * Creates a signal holding `value`.
 *
 * The value is shared with the platform, so it should be serializable with
 * `JSON.stringify` (see `NubeSignalValue`).
 *
 * @example
 * ```ts
 * const count = signal(0);
 * count.subscribe((value) => console.log("count:", value));
 * count.value = 5; // logs "count: 5"
 * ```
 */
export function signal<T>(value: T): Signal<T> {
	return new SignalNode(value);
}

/**
 * Creates a signal derived from `deps`. `fn` runs right away and again
 * whenever one of the dependencies changes; the signal changes only when the
 * result differs (by `Object.is`).
 *
 * @example
 * ```ts
 * const price = signal(10);
 * const quantity = signal(2);
 * const total = computed(() => price.value * quantity.value, [price, quantity]);
 * ```
 *
 * @throws {TypeError} When `deps` is empty or holds something other than signals.
 */
export function computed<T>(
	fn: () => T,
	deps: readonly AnySignal[],
): Computed<T> {
	const sources = readDeps(deps, "computed()");
	const result = new SignalNode<T>(fn(), true);
	const node: Node = {
		seq: result.seq,
		run() {
			try {
				result.write(fn());
			} catch (error) {
				report("Error in a computed signal:", error);
			}
		},
	};
	for (const source of sources) source.addDependent(node);

	Object.defineProperty(result, "dispose", {
		value() {
			for (const source of sources) source.removeDependent(node);
			hooks?.onDispose(result as SignalNode<unknown>);
		},
	});
	return result as unknown as Computed<T>;
}

/**
 * Runs `fn` right away and again whenever one of `deps` changes.
 *
 * @example
 * ```ts
 * const name = signal("Ana");
 * const stop = effect(() => console.log(`Hello, ${name.value}`), [name]);
 * name.value = "Bia"; // logs "Hello, Bia"
 * stop();
 * ```
 *
 * @returns A function that stops the effect and runs its last cleanup.
 * @throws {TypeError} When `deps` is empty or holds something other than signals.
 */
export function effect(
	fn: EffectCallback,
	deps: readonly AnySignal[],
): () => void {
	const sources = readDeps(deps, "effect()");
	let cleanup: (() => void) | undefined;
	let disposed = false;

	const runCleanup = () => {
		const current = cleanup;
		cleanup = undefined;
		if (!current) return;
		try {
			current();
		} catch (error) {
			report("Error in an effect cleanup:", error);
		}
	};

	const node: Node = {
		seq: ++sequence,
		run() {
			runCleanup();
			try {
				const result = fn();
				if (typeof result === "function") cleanup = result as () => void;
			} catch (error) {
				report("Error in an effect:", error);
			}
		},
	};

	for (const source of sources) source.addDependent(node);
	node.run();

	return () => {
		if (disposed) return;
		disposed = true;
		for (const source of sources) source.removeDependent(node);
		runCleanup();
	};
}

/**
 * Applies every write made inside `fn` at once: computed signals, effects and
 * subscribers run a single time after `fn` returns, and the platform gets the
 * new values together.
 *
 * @example
 * ```ts
 * batch(() => {
 *   first.value = "Ana";
 *   last.value = "Lima";
 * }); // an effect on [first, last] runs once
 * ```
 *
 * @returns What `fn` returns.
 */
export function batch<T>(fn: () => T): T {
	batchDepth++;
	try {
		return fn();
	} finally {
		batchDepth--;
		flush();
	}
}
