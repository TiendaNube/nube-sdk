import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { batch, computed, effect, signal } from "./core";

describe("signal", () => {
	it("holds and updates a value", () => {
		const count = signal(0);
		expect(count.value).toBe(0);
		count.value = 5;
		expect(count.value).toBe(5);
	});

	it("notifies subscribers with the new value", () => {
		const count = signal(0);
		const fn = vi.fn();
		count.subscribe(fn);
		count.value = 1;
		expect(fn).toHaveBeenCalledWith(1);
	});

	it("does not notify when the value is the same, by Object.is", () => {
		const value = signal<number>(Number.NaN);
		const fn = vi.fn();
		value.subscribe(fn);
		value.value = Number.NaN;
		expect(fn).not.toHaveBeenCalled();
	});

	it("notifies for an object with the same content but another reference", () => {
		const user = signal({ name: "Ana" });
		const fn = vi.fn();
		user.subscribe(fn);
		user.value = { name: "Ana" };
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it("stops notifying after unsubscribe", () => {
		const count = signal(0);
		const fn = vi.fn();
		const unsubscribe = count.subscribe(fn);
		unsubscribe();
		count.value = 1;
		expect(fn).not.toHaveBeenCalled();
	});

	it("keeps each subscription of the same function apart", () => {
		const count = signal(0);
		const fn = vi.fn();
		const first = count.subscribe(fn);
		count.subscribe(fn);
		first();
		count.value = 1;
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it("isolates a failing subscriber from the others", () => {
		const error = vi.spyOn(console, "error").mockImplementation(() => {});
		const count = signal(0);
		const fn = vi.fn();
		count.subscribe(() => {
			throw new Error("boom");
		});
		count.subscribe(fn);
		count.value = 1;
		expect(fn).toHaveBeenCalledWith(1);
		expect(error).toHaveBeenCalled();
		error.mockRestore();
	});

	it("gives every signal its own id, in the component id format", () => {
		const a = signal(0);
		const b = signal(0);
		expect(a.__internalId).not.toBe(b.__internalId);
		expect(a.__internalId).toMatch(/^signal-test-app-id-[a-z0-9]+$/);
	});

	describe("as a node of a component tree", () => {
		it("serializes to a signal node with the current value", () => {
			const count = signal(3);
			count.value = 4;
			expect(JSON.parse(JSON.stringify({ children: count }))).toEqual({
				children: {
					type: "signal",
					__internalId: count.__internalId,
					initialValue: 4,
				},
			});
		});

		it("keeps the node when spread or cloned", () => {
			const count = signal(3);
			const node = {
				type: "signal",
				__internalId: count.__internalId,
				initialValue: 3,
			};
			expect({ ...count }).toEqual(node);
			expect(structuredClone(count)).toEqual(node);
		});

		it("exposes the current value as initialValue", () => {
			const count = signal(1);
			count.value = 2;
			expect(count.initialValue).toBe(2);
		});

		it("converts to its value as a string", () => {
			expect(`${signal(3)}`).toBe("3");
		});
	});
});

describe("computed", () => {
	it("derives its value from the dependencies", () => {
		const price = signal(10);
		const quantity = signal(2);
		const total = computed(
			() => price.value * quantity.value,
			[price, quantity],
		);
		expect(total.value).toBe(20);
		quantity.value = 3;
		expect(total.value).toBe(30);
	});

	it("notifies only when the result changes", () => {
		const count = signal(1);
		const isEven = computed(() => count.value % 2 === 0, [count]);
		const fn = vi.fn();
		isEven.subscribe(fn);
		count.value = 3;
		expect(fn).not.toHaveBeenCalled();
		count.value = 4;
		expect(fn).toHaveBeenCalledWith(true);
	});

	it("ignores assignments", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const count = signal(1);
		const doubled = computed(() => count.value * 2, [count]);
		(doubled as { value: number }).value = 10;
		expect(doubled.value).toBe(2);
		expect(warn).toHaveBeenCalled();
		warn.mockRestore();
	});

	it("can depend on other computed signals", () => {
		const count = signal(1);
		const doubled = computed(() => count.value * 2, [count]);
		const label = computed(() => `x${doubled.value}`, [doubled]);
		count.value = 2;
		expect(label.value).toBe("x4");
	});

	it("runs once per change in a diamond, never with stale values", () => {
		const a = signal(1);
		const b = computed(() => a.value + 1, [a]);
		const c = computed(() => a.value * 10, [a]);
		const seen: string[] = [];
		const d = computed(() => {
			seen.push(`${b.value}/${c.value}`);
			return b.value + c.value;
		}, [b, c]);
		seen.length = 0;

		a.value = 2;

		expect(seen).toEqual(["3/20"]);
		expect(d.value).toBe(23);
	});

	it("keeps the last value when the function throws", () => {
		const error = vi.spyOn(console, "error").mockImplementation(() => {});
		const count = signal(1);
		const safe = computed(() => {
			if (count.value > 1) throw new Error("boom");
			return count.value;
		}, [count]);
		count.value = 2;
		expect(safe.value).toBe(1);
		expect(error).toHaveBeenCalled();
		error.mockRestore();
	});

	it("stops following the dependencies after dispose", () => {
		const count = signal(1);
		const doubled = computed(() => count.value * 2, [count]);
		doubled.dispose();
		count.value = 5;
		expect(doubled.value).toBe(2);
	});

	it("requires at least one dependency", () => {
		expect(() => computed(() => 1, [])).toThrow(TypeError);
	});

	it("requires dependencies created by the package", () => {
		const fake = {
			type: "signal" as const,
			__internalId: "x",
			initialValue: 1,
			value: 1,
			subscribe: () => () => {},
		};
		expect(() => computed(() => 1, [fake])).toThrow(TypeError);
	});
});

describe("effect", () => {
	it("runs right away and on every change", () => {
		const name = signal("Ana");
		const fn = vi.fn(() => name.value);
		effect(fn, [name]);
		expect(fn).toHaveBeenCalledTimes(1);
		name.value = "Bia";
		expect(fn).toHaveBeenCalledTimes(2);
	});

	it("runs the cleanup before the next run and on dispose", () => {
		const count = signal(0);
		const cleanup = vi.fn();
		const stop = effect(() => cleanup, [count]);
		count.value = 1;
		expect(cleanup).toHaveBeenCalledTimes(1);
		stop();
		expect(cleanup).toHaveBeenCalledTimes(2);
	});

	it("does not run after dispose", () => {
		const count = signal(0);
		const fn = vi.fn();
		const stop = effect(fn, [count]);
		stop();
		stop();
		count.value = 1;
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it("runs once per change when two dependencies derive from the same signal", () => {
		const a = signal(1);
		const b = computed(() => a.value + 1, [a]);
		const c = computed(() => a.value + 2, [a]);
		const fn = vi.fn();
		effect(fn, [b, c]);
		a.value = 2;
		expect(fn).toHaveBeenCalledTimes(2);
	});

	it("keeps running after an error", () => {
		const error = vi.spyOn(console, "error").mockImplementation(() => {});
		const count = signal(0);
		const fn = vi.fn(() => {
			throw new Error("boom");
		});
		effect(fn, [count]);
		count.value = 1;
		expect(fn).toHaveBeenCalledTimes(2);
		expect(error).toHaveBeenCalledTimes(2);
		error.mockRestore();
	});

	it("stops an effect that keeps writing to its own dependency", () => {
		const error = vi.spyOn(console, "error").mockImplementation(() => {});
		const count = signal(0);
		effect(() => {
			count.value = count.value + 1;
		}, [count]);
		expect(error).toHaveBeenCalledWith(
			expect.stringContaining("Too many updates"),
			undefined,
		);
		error.mockRestore();
	});

	it("requires at least one dependency", () => {
		expect(() => effect(() => {}, [])).toThrow(TypeError);
	});
});

describe("batch", () => {
	let first: ReturnType<typeof signal<string>>;
	let last: ReturnType<typeof signal<string>>;

	beforeEach(() => {
		first = signal("Ana");
		last = signal("Lima");
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("runs dependents once after all writes", () => {
		const fn = vi.fn(() => `${first.value} ${last.value}`);
		effect(fn, [first, last]);
		batch(() => {
			first.value = "Bia";
			last.value = "Souza";
		});
		expect(fn).toHaveBeenCalledTimes(2);
		expect(fn).toHaveLastReturnedWith("Bia Souza");
	});

	it("defers subscribers until the end", () => {
		const fn = vi.fn();
		first.subscribe(fn);
		batch(() => {
			first.value = "Bia";
			expect(fn).not.toHaveBeenCalled();
		});
		expect(fn).toHaveBeenCalledWith("Bia");
	});

	it("supports nesting and returns the result of fn", () => {
		const fn = vi.fn();
		effect(fn, [first]);
		const result = batch(() => {
			batch(() => {
				first.value = "Bia";
			});
			expect(fn).toHaveBeenCalledTimes(1);
			return 42;
		});
		expect(result).toBe(42);
		expect(fn).toHaveBeenCalledTimes(2);
	});

	it("flushes even when fn throws", () => {
		const fn = vi.fn();
		effect(fn, [first]);
		expect(() =>
			batch(() => {
				first.value = "Bia";
				throw new Error("boom");
			}),
		).toThrow("boom");
		expect(fn).toHaveBeenCalledTimes(2);
	});
});
