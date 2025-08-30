import { beforeEach, describe, expect, it, vi } from "vitest";
import { safe } from "./safe";

describe("safe", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(console, "error").mockImplementation(() => {});
	});

	it("should execute function successfully", () => {
		const mockFn = vi.fn();
		safe(mockFn, "Test error:");

		expect(mockFn).toHaveBeenCalledTimes(1);
		expect(console.error).not.toHaveBeenCalled();
	});

	it("should catch and log error when function throws", () => {
		const error = new Error("Test error");
		const mockFn = vi.fn().mockImplementation(() => {
			throw error;
		});

		safe(mockFn, "Test error:");

		expect(mockFn).toHaveBeenCalledTimes(1);
		expect(console.error).toHaveBeenCalledWith("Test error:", error);
	});

	it("should not propagate error", () => {
		const mockFn = vi.fn().mockImplementation(() => {
			throw new Error("Test error");
		});

		expect(() => {
			safe(mockFn, "Test error:");
		}).not.toThrow();
	});

	it("should work with different error types", () => {
		const mockFn = vi.fn().mockImplementation(() => {
			throw "String error";
		});

		safe(mockFn, "String error:");

		expect(console.error).toHaveBeenCalledWith("String error:", "String error");
	});
});
