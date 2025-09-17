import { describe, expect, it } from "vitest";
import {
	isDefined,
	isNonEmptyString,
	isObject,
	isPlainObject,
	isValidNumber,
} from "./typeguards.js";

describe("Type Guards", () => {
	describe("isObject", () => {
		it("should return true for any object (including arrays, dates, etc.)", () => {
			expect(isObject({})).toBe(true);
			expect(isObject({ key: "value" })).toBe(true);
			expect(isObject([])).toBe(true);
			expect(isObject(new Date())).toBe(true);
			expect(isObject(/test/)).toBe(true);
		});

		it("should return false for null and primitive values", () => {
			expect(isObject(null)).toBe(false);
			expect(isObject(undefined)).toBe(false);
			expect(isObject("string")).toBe(false);
			expect(isObject(123)).toBe(false);
			expect(isObject(true)).toBe(false);
		});
	});

	describe("isPlainObject", () => {
		it("should return true for plain objects only", () => {
			expect(isPlainObject({})).toBe(true);
			expect(isPlainObject({ key: "value" })).toBe(true);
		});

		it("should return false for arrays, dates, and other built-in objects", () => {
			expect(isPlainObject(null)).toBe(false);
			expect(isPlainObject(undefined)).toBe(false);
			expect(isPlainObject("string")).toBe(false);
			expect(isPlainObject(123)).toBe(false);
			expect(isPlainObject([])).toBe(false);
			expect(isPlainObject(new Date())).toBe(false);
			expect(isPlainObject(/test/)).toBe(false);
		});
	});

	describe("isNonEmptyString", () => {
		it("should return true for non-empty strings", () => {
			expect(isNonEmptyString("hello")).toBe(true);
			expect(isNonEmptyString("  test  ")).toBe(true);
		});

		it("should return false for empty or non-string values", () => {
			expect(isNonEmptyString("")).toBe(false);
			expect(isNonEmptyString("   ")).toBe(false);
			expect(isNonEmptyString(null)).toBe(false);
			expect(isNonEmptyString(undefined)).toBe(false);
			expect(isNonEmptyString(123)).toBe(false);
		});
	});

	describe("isValidNumber", () => {
		it("should return true for valid numbers", () => {
			expect(isValidNumber(0)).toBe(true);
			expect(isValidNumber(123)).toBe(true);
			expect(isValidNumber(-456)).toBe(true);
			expect(isValidNumber(3.14)).toBe(true);
		});

		it("should return false for invalid numbers and non-numbers", () => {
			expect(isValidNumber(Number.NaN)).toBe(false);
			expect(isValidNumber("123")).toBe(false);
			expect(isValidNumber(null)).toBe(false);
			expect(isValidNumber(undefined)).toBe(false);
		});
	});

	describe("isDefined", () => {
		it("should return true for defined values", () => {
			expect(isDefined(0)).toBe(true);
			expect(isDefined("")).toBe(true);
			expect(isDefined(false)).toBe(true);
			expect(isDefined({})).toBe(true);
			expect(isDefined([])).toBe(true);
		});

		it("should return false for null and undefined", () => {
			expect(isDefined(null)).toBe(false);
			expect(isDefined(undefined)).toBe(false);
		});
	});
});
