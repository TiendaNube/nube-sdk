import { safe } from "./safe";
import { shortid } from "./shortid";

/**
 * A function that gets called when a signal value changes.
 * @template T - The type of the signal value
 * @param value - The new value of the signal
 */
export type Subscriber<T> = (value: T) => void;

/**
 * A reactive signal that holds a value and notifies subscribers when it changes.
 * @template T - The type of the signal value
 */
export type Signal<T> = {
	/** The current value of the signal */
	value: T;
	/**
	 * Subscribe to changes in the signal value.
	 * @param fn - The function to call when the signal value changes
	 * @returns A function to unsubscribe from the signal
	 */
	subscribe: (fn: Subscriber<T>) => () => void;
};

/**
 * A read-only version of a signal that prevents direct value assignment.
 * @template T - The type of the signal value
 */
export type ReadonlySignal<T> = Omit<Signal<T>, "value"> & {
	/** The current value of the signal (read-only) */
	readonly value: T;
};

// Global registry to store signal references by ID
const signalRegistry = new Map<string, (value: unknown) => void>();

type SignalMessage = {
	type: "signal-created" | "signal-update";
	id: string;
	value: unknown;
};

// Global message listener for synchronization
let messageListenerInitialized = false;

function initializeMessageListener() {
	if (messageListenerInitialized) return;

	self.addEventListener("message", (event) => {
		const message = event.data as SignalMessage;

		if (message.type === "signal-update") {
			const updateFn = signalRegistry.get(message.id);
			if (updateFn) updateFn(message.value);
		}
	});

	messageListenerInitialized = true;
}

/**
 * Internal implementation of a writable signal that can be read and written to.
 * This class provides the core functionality for reactive signals including
 * value storage, subscriber management, and change notifications.
 *
 * @template T - The type of the signal value
 */
class WritableSignal<T> implements Signal<T> {
	private val: T;
	readonly id: string;
	private subscribers: Set<Subscriber<T>> = new Set();

	/**
	 * Creates a new writable signal with an initial value.
	 *
	 * @param value - The initial value for the signal
	 */
	constructor(value: T) {
		this.val = value;
		this.id = shortid();

		// Register the update function in the global registry
		signalRegistry.set(this.id, (value: unknown) =>
			this.updateValueFromMessage(value),
		);

		// Initialize the message listener if it hasn't been initialized yet
		initializeMessageListener();

		self.postMessage({ type: "signal-created", id: this.id, value });
	}

	get value() {
		return this.val;
	}

	set value(newVal: T) {
		if (newVal === this.val) return;
		this.val = newVal;
		this.notify();
		self.postMessage({ type: "signal-update", id: this.id, value: newVal });
	}

	subscribe(fn: Subscriber<T>): () => void {
		this.subscribers.add(fn);
		return () => this.subscribers.delete(fn);
	}

	private notify() {
		for (const sub of this.subscribers) {
			safe(() => sub(this.val), "Subscriber error:");
		}
	}

	// Public method for internal update (used by computed)
	protected updateInternalValue(newVal: T) {
		this.val = newVal;
		this.notify();
		self.postMessage({ type: "signal-update", id: this.id, value: newVal });
	}

	// Method for update via message (without triggering postMessage)
	updateValueFromMessage(newVal: unknown) {
		this.val = newVal as T;
		this.notify();
	}
}

/**
 * Internal implementation of a computed signal that automatically updates
 * when its dependencies change. This class extends WritableSignal but
 * prevents direct value assignment.
 *
 * @template T - The type of the computed value
 */
class ComputedSignal<T> extends WritableSignal<T> {
	get value() {
		return super.value;
	}

	set value(newVal: T) {
		// Fail silently - ignore attempts to change the value of a computed signal
		console.warn("Attempted to assign to computed signal - ignoring");
	}

	updateValue(newVal: T) {
		this.updateInternalValue(newVal);
	}
}

/**
 * Creates a new reactive signal with an initial value.
 *
 * @template T - The type of the signal value
 * @param value - The initial value for the signal
 * @returns A new signal instance that can be read and written to
 *
 * @example
 * ```typescript
 * const count = signal(0);
 * count.value = 5; // Update the signal
 * console.log(count.value); // 5
 *
 * count.subscribe((newValue) => {
 *   console.log('Count changed to:', newValue);
 * });
 * ```
 */
export function signal<T>(value: T): Signal<T> {
	return new WritableSignal(value);
}

/**
 * Creates a computed signal that automatically updates when its dependencies change.
 *
 * @template T - The type of the computed value
 * @param fn - A function that computes the signal value based on dependencies
 * @param deps - An array of signals that this computed signal depends on
 * @returns A read-only signal that automatically updates when dependencies change
 *
 * @example
 * ```typescript
 * const count = signal(5);
 * const doubled = computed(() => count.value * 2, [count]);
 *
 * console.log(doubled.value); // 10
 * count.value = 8;
 * console.log(doubled.value); // 16
 *
 * // Attempting to set the value will fail silently
 * doubled.value = 20; // This will be ignored
 * ```
 */
export function computed<T>(
	fn: () => T,
	deps?: Signal<unknown>[],
): ReadonlySignal<T> {
	const initialValue = fn();
	const result = new ComputedSignal<T>(initialValue);

	// If there are no dependencies, return the signal without subscriptions
	if (!deps || deps.length === 0) {
		console.warn("Computed signal has no dependencies");
		return result as ReadonlySignal<T>;
	}

	// Configure subscriptions for each dependency
	for (const dep of deps) {
		dep.subscribe(() => {
			safe(() => {
				const newValue = fn();
				if (result.value !== newValue) result.updateValue(newValue);
			}, "Error in computed signal:");
		});
	}

	return result as ReadonlySignal<T>;
}

/**
 * Creates a side effect that runs when dependencies change.
 *
 * @param fn - A function that performs side effects
 * @param deps - An array of signals that this effect depends on (must contain at least one dependency)
 * @throws {Error} When no dependencies are provided or the dependencies array is empty
 *
 * @example
 * ```typescript
 * const count = signal(0);
 * const name = signal("John");
 *
 * // Effect runs immediately and whenever count or name changes
 * effect(() => {
 *   console.log(`${name.value}: ${count.value}`);
 * }, [count, name]);
 *
 * count.value = 5; // Logs: "John: 5"
 * name.value = "Jane"; // Logs: "Jane: 5"
 * ```
 *
 * @example
 * ```typescript
 * const theme = signal("light");
 *
 * // Effect for DOM manipulation
 * effect(() => {
 *   document.body.className = theme.value;
 * }, [theme]);
 * ```
 */
export function effect(fn: () => void, deps: Signal<unknown>[]): void {
	// Validate that deps is provided and contains at least one dependency
	if (!deps || deps.length === 0) {
		throw new Error("Effect must have at least one dependency");
	}

	safe(fn, "Error in effect:");

	// Configure subscriptions for each dependency
	for (const dep of deps) {
		dep.subscribe(() => {
			safe(fn, "Error in effect:");
		});
	}
}
