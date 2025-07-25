import { describe, expect, it } from "vitest";
import { shortid } from "./shortid";

describe("shortid", () => {
	it("should generate ID with default length of 8", () => {
		const id = shortid();
		expect(id).toHaveLength(8);
	});

	it("should generate ID with custom length", () => {
		const id = shortid(12);
		expect(id).toHaveLength(12);
	});

	it("should generate ID with length 1", () => {
		const id = shortid(1);
		expect(id).toHaveLength(1);
	});

	it("should generate ID with length 0", () => {
		const id = shortid(0);
		expect(id).toHaveLength(0);
	});

	it("should throw error for negative length", () => {
		expect(() => shortid(-5)).toThrow("Invalid typed array length");
	});

	it("should only contain valid characters", () => {
		const validChars =
			"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
		const id = shortid(20);

		for (const char of id) {
			expect(validChars).toContain(char);
		}
	});

	it("should generate different IDs on multiple calls", () => {
		const id1 = shortid();
		const id2 = shortid();

		expect(id1).not.toBe(id2);
	});

	it("should handle large lengths", () => {
		const id = shortid(100);
		expect(id).toHaveLength(100);
	});
});
