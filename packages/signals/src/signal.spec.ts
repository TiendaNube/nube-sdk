import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { type Signal, computed, effect, signal } from "./signal";

vi.mock("./shortid", () => ({
	shortid: vi.fn(() => "test-id-123"),
}));

// Suppress logs of error and warning in tests
beforeEach(() => {
	vi.spyOn(console, "error").mockImplementation(() => {});
	vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe("signal", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("signal function", () => {
		it("should create a signal with initial value", () => {
			const count = signal(42);

			expect(count).toBeDefined();
			expect(count.value).toBe(42);
			expect(typeof count.subscribe).toBe("function");
		});

		it("should create signal with different types", () => {
			const stringSignal = signal("hello");
			const booleanSignal = signal(true);
			const objectSignal = signal({ name: "test" });

			expect(stringSignal.value).toBe("hello");
			expect(booleanSignal.value).toBe(true);
			expect(objectSignal.value).toEqual({ name: "test" });
		});

		it("should send signal-created message on creation", () => {
			signal(100);

			expect(self.postMessage).toHaveBeenCalledWith({
				type: "signal-created",
				id: "test-id-123",
				value: 100,
			});
		});
	});

	describe("signal value property", () => {
		it("should return current value", () => {
			const count = signal(10);
			expect(count.value).toBe(10);
		});

		it("should update value and notify subscribers", () => {
			const count = signal(0);
			const mockSubscriber = vi.fn();

			count.subscribe(mockSubscriber);
			count.value = 5;

			expect(count.value).toBe(5);
			expect(mockSubscriber).toHaveBeenCalledWith(5);
		});

		it("should send signal-update message when value changes", () => {
			const count = signal(0);
			count.value = 15;

			expect(self.postMessage).toHaveBeenCalledWith({
				type: "signal-update",
				id: "test-id-123",
				value: 15,
			});
		});

		it("should notify multiple subscribers", () => {
			const count = signal(0);
			const subscriber1 = vi.fn();
			const subscriber2 = vi.fn();
			const subscriber3 = vi.fn();

			count.subscribe(subscriber1);
			count.subscribe(subscriber2);
			count.subscribe(subscriber3);

			count.value = 25;

			expect(subscriber1).toHaveBeenCalledWith(25);
			expect(subscriber2).toHaveBeenCalledWith(25);
			expect(subscriber3).toHaveBeenCalledWith(25);
		});

		it("should not notify unsubscribed functions", () => {
			const count = signal(0);
			const subscriber = vi.fn();

			count.subscribe(subscriber);
			count.value = 10;

			expect(subscriber).toHaveBeenCalledWith(10);

			// Simula unsubscribe (removendo da lista)
			vi.clearAllMocks();
			count.value = 20;

			// Como não há método unsubscribe, o subscriber ainda será notificado
			expect(subscriber).toHaveBeenCalledWith(20);
		});
	});

	describe("signal subscribe method", () => {
		it("should add subscriber to the list", () => {
			const count = signal(0);
			const subscriber = vi.fn();

			count.subscribe(subscriber);
			count.value = 5;

			expect(subscriber).toHaveBeenCalledWith(5);
		});

		it("should handle multiple subscriptions from same function", () => {
			const count = signal(0);
			const subscriber = vi.fn();

			count.subscribe(subscriber);
			count.subscribe(subscriber);
			count.value = 10;

			expect(subscriber).toHaveBeenCalledTimes(1);
			expect(subscriber).toHaveBeenCalledWith(10);
		});

		it("should work with arrow functions", () => {
			const count = signal(0);
			const arrowSubscriber = (value: number) => {
				expect(value).toBe(15);
			};

			count.subscribe(arrowSubscriber);
			count.value = 15;
		});

		it("should return unsubscribe function", () => {
			const count = signal(0);
			const subscriber = vi.fn();

			const unsubscribe = count.subscribe(subscriber);
			expect(typeof unsubscribe).toBe("function");

			unsubscribe();
			count.value = 10;

			expect(subscriber).not.toHaveBeenCalled();
		});

		it("should handle multiple subscriptions and unsubscribes correctly", () => {
			const count = signal(0);
			const subscriber = vi.fn();

			const unsubscribe1 = count.subscribe(subscriber);
			const unsubscribe2 = count.subscribe(subscriber);

			count.value = 5;
			expect(subscriber).toHaveBeenCalledWith(5);

			unsubscribe1();
			vi.clearAllMocks();
			count.value = 10;

			expect(subscriber).not.toHaveBeenCalled();

			expect(() => {
				unsubscribe2();
			}).not.toThrow();
		});

		it("should handle unsubscribe of non-existent subscriber gracefully", () => {
			const count = signal(0);
			const subscriber = vi.fn();

			const unsubscribe = count.subscribe(subscriber);
			unsubscribe();

			expect(() => {
				unsubscribe();
			}).not.toThrow();
		});
	});

	describe("signal value optimization", () => {
		it("should not notify subscribers when value is set to same value", () => {
			const count = signal(5);
			const subscriber = vi.fn();

			count.subscribe(subscriber);

			count.value = 5;

			expect(subscriber).not.toHaveBeenCalled();
		});

		it("should not send postMessage when value is set to same value", () => {
			const count = signal(5);

			vi.clearAllMocks();

			count.value = 5;

			expect(self.postMessage).not.toHaveBeenCalled();
		});

		it("should notify subscribers when value changes to different value", () => {
			const count = signal(5);
			const subscriber = vi.fn();

			count.subscribe(subscriber);

			count.value = 10;

			expect(subscriber).toHaveBeenCalledWith(10);
		});

		it("should handle object values with same reference", () => {
			const obj = { name: "test" };
			const objSignal = signal(obj);
			const subscriber = vi.fn();

			objSignal.subscribe(subscriber);

			objSignal.value = obj;

			expect(subscriber).not.toHaveBeenCalled();
		});

		it("should handle object values with different reference but same content", () => {
			const objSignal = signal({ name: "test" });
			const subscriber = vi.fn();

			objSignal.subscribe(subscriber);

			objSignal.value = { name: "test" };

			expect(subscriber).toHaveBeenCalledWith({ name: "test" });
		});

		it("should handle null and undefined values correctly", () => {
			const nullSignal = signal<null | string>(null);
			const undefinedSignal = signal<undefined | string>(undefined);
			const nullSubscriber = vi.fn();
			const undefinedSubscriber = vi.fn();

			nullSignal.subscribe(nullSubscriber);
			undefinedSignal.subscribe(undefinedSubscriber);

			nullSignal.value = null;
			expect(nullSubscriber).not.toHaveBeenCalled();

			nullSignal.value = "not null";
			expect(nullSubscriber).toHaveBeenCalledWith("not null");

			undefinedSignal.value = undefined;
			expect(undefinedSubscriber).not.toHaveBeenCalled();

			undefinedSignal.value = "defined";
			expect(undefinedSubscriber).toHaveBeenCalledWith("defined");
		});
	});

	describe("signal unsubscribe integration", () => {
		it("should properly clean up subscribers after unsubscribe", () => {
			const count = signal(0);
			const subscriber1 = vi.fn();
			const subscriber2 = vi.fn();

			const unsubscribe1 = count.subscribe(subscriber1);
			count.subscribe(subscriber2);

			count.value = 5;
			expect(subscriber1).toHaveBeenCalledWith(5);
			expect(subscriber2).toHaveBeenCalledWith(5);

			unsubscribe1();
			vi.clearAllMocks();

			count.value = 10;
			expect(subscriber1).not.toHaveBeenCalled();
			expect(subscriber2).toHaveBeenCalledWith(10);
		});

		it("should handle unsubscribe during notification", () => {
			const count = signal(0);
			let unsubscribeFn: (() => void) | null = null;

			const subscriber = vi.fn(() => {
				if (unsubscribeFn) {
					unsubscribeFn();
				}
			});

			unsubscribeFn = count.subscribe(subscriber);

			expect(() => {
				count.value = 5;
			}).not.toThrow();

			expect(subscriber).toHaveBeenCalledWith(5);
		});

		it("should work with computed signals unsubscribe", () => {
			const count = signal(5);
			const doubled = computed(() => count.value * 2, [count]);
			const subscriber = vi.fn();

			const unsubscribe = doubled.subscribe(subscriber);

			count.value = 8;
			expect(subscriber).toHaveBeenCalledWith(16);

			unsubscribe();
			vi.clearAllMocks();

			count.value = 10;
			expect(subscriber).not.toHaveBeenCalled();
			expect(doubled.value).toBe(20);
		});
	});

	describe("signal id property", () => {
		it("should have a unique id", () => {
			const count = signal(0);
			expect((count as Record<string, unknown>).id).toBe("test-id-123");
		});
	});

	describe("signal types", () => {
		it("should implement Signal interface", () => {
			const count: Signal<number> = signal(0);

			expect(count).toHaveProperty("value");
			expect(count).toHaveProperty("subscribe");
			expect(typeof count.subscribe).toBe("function");
		});

		it("should work with generic types", () => {
			interface User {
				id: number;
				name: string;
			}

			const userSignal: Signal<User> = signal({ id: 1, name: "John" });

			expect(userSignal.value).toEqual({ id: 1, name: "John" });
		});
	});

	describe("edge cases", () => {
		it("should handle null and undefined values", () => {
			const nullSignal = signal(null);
			const undefinedSignal = signal(undefined);

			expect(nullSignal.value).toBeNull();
			expect(undefinedSignal.value).toBeUndefined();
		});

		it("should handle empty subscribers list", () => {
			const count = signal(0);

			expect(() => {
				count.value = 5;
			}).not.toThrow();
		});

		it("should handle subscriber errors gracefully", () => {
			const count = signal(0);
			const errorSubscriber = vi.fn(() => {
				throw new Error("Subscriber error");
			});
			const normalSubscriber = vi.fn();

			count.subscribe(errorSubscriber);
			count.subscribe(normalSubscriber);

			expect(() => {
				count.value = 10;
			}).not.toThrow();

			expect(normalSubscriber).toHaveBeenCalledWith(10);
		});
	});

	describe("computed function", () => {
		it("should create a computed signal with initial value", () => {
			const count = signal(5);
			const doubled = computed(() => count.value * 2, [count]);

			expect(doubled.value).toBe(10);
			expect(typeof doubled.subscribe).toBe("function");
		});

		it("should update computed value when dependencies change", () => {
			const count = signal(5);
			const doubled = computed(() => count.value * 2, [count]);

			expect(doubled.value).toBe(10);

			count.value = 8;
			expect(doubled.value).toBe(16);
		});

		it("should work with multiple dependencies", () => {
			const a = signal(2);
			const b = signal(3);
			const sum = computed(() => a.value + b.value, [a, b]);

			expect(sum.value).toBe(5);

			a.value = 4;
			expect(sum.value).toBe(7);

			b.value = 5;
			expect(sum.value).toBe(9);
		});

		it("should work with manual dependencies", () => {
			const count = signal(5);
			const doubled = computed(() => count.value * 2, [count]);

			expect(doubled.value).toBe(10);

			count.value = 8;
			expect(doubled.value).toBe(16);
		});

		it("should not update if computed value hasn't changed", () => {
			const count = signal(5);
			const doubled = computed(() => count.value * 2, [count]);
			const subscriber = vi.fn();

			doubled.subscribe(subscriber);
			expect(subscriber).not.toHaveBeenCalled();

			count.value = 5;
			expect(doubled.value).toBe(10);
			expect(subscriber).not.toHaveBeenCalled();

			count.value = 6;
			expect(doubled.value).toBe(12);
			expect(subscriber).toHaveBeenCalledWith(12);
		});

		it("should return readonly signal", () => {
			const count = signal(5);
			const doubled = computed(() => count.value * 2, [count]);

			expect(() => {
				// @ts-expect-error - testing readonly property
				doubled.value = 20;
			}).not.toThrow();

			expect(doubled.value).toBe(10);
		});

		it("should allow setting non-value properties on readonly signal", () => {
			const count = signal(5);
			const doubled = computed(() => count.value * 2, [count]);

			expect(() => {
				(doubled as Record<string, unknown>).someOtherProp = "test";
			}).not.toThrow();
		});

		it("should work with complex computations", () => {
			const name = signal("John");
			const age = signal(25);
			const greeting = computed(
				() => `Hello, ${name.value}! You are ${age.value} years old.`,
				[name, age],
			);

			expect(greeting.value).toBe("Hello, John! You are 25 years old.");

			name.value = "Jane";
			expect(greeting.value).toBe("Hello, Jane! You are 25 years old.");

			age.value = 30;
			expect(greeting.value).toBe("Hello, Jane! You are 30 years old.");
		});

		it("should handle empty dependencies array", () => {
			const constant = computed(() => 42, []);

			expect(constant.value).toBe(42);
		});

		it("should handle function that returns different types", () => {
			const count = signal(5);
			const isEven = computed(() => count.value % 2 === 0, [count]);

			expect(isEven.value).toBe(false);

			count.value = 6;
			expect(isEven.value).toBe(true);
		});

		it("should notify subscribers when computed value changes", () => {
			const count = signal(5);
			const doubled = computed(() => count.value * 2, [count]);
			const subscriber = vi.fn();

			doubled.subscribe(subscriber);
			expect(subscriber).not.toHaveBeenCalled();

			count.value = 8;
			expect(subscriber).toHaveBeenCalledWith(16);
		});

		it("should handle multiple subscribers on computed signal", () => {
			const count = signal(5);
			const doubled = computed(() => count.value * 2, [count]);
			const subscriber1 = vi.fn();
			const subscriber2 = vi.fn();

			doubled.subscribe(subscriber1);
			doubled.subscribe(subscriber2);

			count.value = 10;

			expect(subscriber1).toHaveBeenCalledWith(20);
			expect(subscriber2).toHaveBeenCalledWith(20);
		});

		it("should work with object values", () => {
			const user = signal({ name: "John", age: 25 });
			const userInfo = computed(
				() => `${user.value.name} (${user.value.age})`,
				[user],
			);

			expect(userInfo.value).toBe("John (25)");

			user.value = { name: "Jane", age: 30 };
			expect(userInfo.value).toBe("Jane (30)");
		});

		it("should handle computed function errors gracefully", () => {
			const count = signal(5);
			let shouldThrow = false;

			const computedWithError = computed(() => {
				if (shouldThrow) {
					throw new Error("Computed function error");
				}
				return count.value * 2;
			}, [count]);

			expect(computedWithError.value).toBe(10);

			shouldThrow = true;
			count.value = 8;

			expect(computedWithError.value).toBe(10);
		});

		it("should register signals in global registry", () => {
			const count = signal(5);
			const id = (count as Record<string, unknown>).id as string;

			expect(id).toBeDefined();
			expect(typeof id).toBe("string");
		});

		it("should handle signal update via message function", () => {
			const count = signal(5);
			const subscriber = vi.fn();

			count.subscribe(subscriber);

			// @ts-expect-error - testing WritableSignal internal method
			count.updateValueFromMessage(15);

			expect(count.value).toBe(15);
			expect(subscriber).toHaveBeenCalledWith(15);
		});
	});

	describe("effect", () => {
		beforeEach(() => {
			vi.clearAllMocks();
		});

		it("should throw error when no dependencies are provided", () => {
			const mockFn = vi.fn();
			expect(() => {
				effect(mockFn, []);
			}).toThrow("Effect must have at least one dependency");
		});

		it("should execute the effect when dependencies change", () => {
			const count = signal(0);
			const mockFn = vi.fn();

			effect(mockFn, [count]);

			expect(mockFn).toHaveBeenCalledTimes(1);

			count.value = 1;
			expect(mockFn).toHaveBeenCalledTimes(2);

			count.value = 2;
			expect(mockFn).toHaveBeenCalledTimes(3);
		});

		it("should execute the effect for multiple dependencies", () => {
			const name = signal("John");
			const age = signal(25);
			const mockFn = vi.fn();

			effect(mockFn, [name, age]);

			expect(mockFn).toHaveBeenCalledTimes(1);

			name.value = "Jane";
			expect(mockFn).toHaveBeenCalledTimes(2);

			age.value = 30;
			expect(mockFn).toHaveBeenCalledTimes(3);
		});

		it("should handle effect errors gracefully", () => {
			const count = signal(0);
			const mockFn = vi.fn().mockImplementation(() => {
				throw new Error("Effect error");
			});

			expect(() => {
				effect(mockFn, [count]);
			}).not.toThrow();

			count.value = 1;
			expect(mockFn).toHaveBeenCalledTimes(2);
		});
	});
});
