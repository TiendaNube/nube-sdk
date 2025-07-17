import { describe, expect, it } from "vitest";
import { shortid } from "./shortid";

describe("shortid", () => {
	it("should generate a short ID with default length", () => {
		const id = shortid();
		expect(id).toHaveLength(8);
		expect(id).toMatch(/^[a-zA-Z0-9]+$/);
	});

	it("should generate a short ID with custom length", () => {
		const id = shortid(12);
		expect(id).toHaveLength(12);
		expect(id).toMatch(/^[a-zA-Z0-9]+$/);
	});

	it("should generate a short ID with length 1", () => {
		const id = shortid(1);
		expect(id).toHaveLength(1);
		expect(id).toMatch(/^[a-zA-Z0-9]+$/);
	});

	it("should generate a short ID with length 0", () => {
		const id = shortid(0);
		expect(id).toHaveLength(0);
		expect(id).toBe("");
	});

	it("should generate different IDs on multiple calls", () => {
		const id1 = shortid();
		const id2 = shortid();
		const id3 = shortid();

		expect(id1).not.toBe(id2);
		expect(id1).not.toBe(id3);
		expect(id2).not.toBe(id3);
	});

	it("should generate IDs with only alphanumeric characters", () => {
		const id = shortid(20);
		expect(id).toMatch(/^[a-zA-Z0-9]+$/);
		expect(id).not.toMatch(/[^a-zA-Z0-9]/);
	});

	it("should throw error for negative length", () => {
		expect(() => shortid(-5)).toThrow("Invalid typed array length: -5");
	});

	it("should generate IDs with mixed case letters and numbers", () => {
		const id = shortid(50);
		expect(id).toHaveLength(50);
		expect(id).toMatch(/^[a-zA-Z0-9]+$/);

		expect(id).toMatch(/[a-z]/);
		expect(id).toMatch(/[A-Z]/);
		expect(id).toMatch(/[0-9]/);
	});

	it("should generate consistent length for same parameter", () => {
		const length = 15;
		const id1 = shortid(length);
		const id2 = shortid(length);
		const id3 = shortid(length);

		expect(id1).toHaveLength(length);
		expect(id2).toHaveLength(length);
		expect(id3).toHaveLength(length);
	});

	it("should generate unique IDs even with same length", () => {
		const length = 10;
		const ids = new Set();

		for (let i = 0; i < 100; i++) {
			const id = shortid(length);
			expect(id).toHaveLength(length);
			ids.add(id);
		}

		expect(ids.size).toBe(100);
	});

	it("should handle very large length", () => {
		const id = shortid(1000);
		expect(id).toHaveLength(1000);
		expect(id).toMatch(/^[a-zA-Z0-9]+$/);
	});

	it("should handle decimal length parameter", () => {
		const id = shortid(5.7);
		expect(id).toHaveLength(5);
		expect(id).toMatch(/^[a-zA-Z0-9]+$/);
	});

	it("should handle very small length", () => {
		const id = shortid(1);
		expect(id).toHaveLength(1);
		expect(id).toMatch(/^[a-zA-Z0-9]+$/);
	});

	it("should generate IDs with proper character distribution", () => {
		const id = shortid(100);
		const chars =
			"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

		for (const char of id) {
			expect(chars).toContain(char);
		}
	});
});
