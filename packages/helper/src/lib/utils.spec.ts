import { describe, expect, it, vi } from "vitest";
import { debounce, deepClone, throttle } from "./utils.js";

describe("Utility Functions", () => {
	describe("deepClone", () => {
		it("should clone primitive values", () => {
			expect(deepClone(42)).toBe(42);
			expect(deepClone("hello")).toBe("hello");
			expect(deepClone(true)).toBe(true);
			expect(deepClone(null)).toBe(null);
		});

		it("should deep clone objects", () => {
			const original = { a: 1, b: { c: 2 } };
			const cloned = deepClone(original);

			expect(cloned).toEqual(original);
			expect(cloned).not.toBe(original);
			expect(cloned.b).not.toBe(original.b);
		});

		it("should deep clone arrays", () => {
			const original = [1, [2, 3], { a: 4 }];
			const cloned = deepClone(original);

			expect(cloned).toEqual(original);
			expect(cloned).not.toBe(original);
			expect(cloned[1]).not.toBe(original[1]);
			expect(cloned[2]).not.toBe(original[2]);
		});
	});

	describe("debounce", () => {
		it("should debounce function calls", async () => {
			const mockFn = vi.fn();
			const debouncedFn = debounce(mockFn, 100);

			debouncedFn();
			debouncedFn();
			debouncedFn();

			expect(mockFn).not.toHaveBeenCalled();

			await new Promise((resolve) => setTimeout(resolve, 150));
			expect(mockFn).toHaveBeenCalledTimes(1);
		});
	});

	describe("throttle", () => {
		it("should throttle function calls", async () => {
			const mockFn = vi.fn();
			const throttledFn = throttle(mockFn, 100);

			throttledFn();
			throttledFn();
			throttledFn();

			expect(mockFn).toHaveBeenCalledTimes(1);

			await new Promise((resolve) => setTimeout(resolve, 150));
			throttledFn();
			expect(mockFn).toHaveBeenCalledTimes(2);
		});
	});
});
