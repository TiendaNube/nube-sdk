import { describe, expect, it } from "vitest";
import { isPageStorageType, parseStorageEvent } from "./storage-event";

describe("parseStorageEvent", () => {
	it("accepts a well-formed setItem", () => {
		expect(
			parseStorageEvent({
				method: "setItem",
				type: "localStorage",
				key: "app-1-foo",
				value: "bar",
				timestamp: 10,
			}),
		).toEqual({
			method: "setItem",
			type: "localStorage",
			key: "app-1-foo",
			value: "bar",
			timestamp: 10,
		});
	});

	it("accepts removeItem and clear without a value", () => {
		expect(
			parseStorageEvent({
				method: "removeItem",
				type: "sessionStorage",
				key: "app-1-foo",
				value: null,
			}),
		).toEqual({
			method: "removeItem",
			type: "sessionStorage",
			key: "app-1-foo",
			value: null,
		});
		expect(
			parseStorageEvent({ method: "clear", type: "localStorage", key: "" }),
		).toEqual({ method: "clear", type: "localStorage", key: "", value: null });
	});

	it("drops fields it does not know", () => {
		const event = parseStorageEvent({
			method: "clear",
			type: "localStorage",
			key: "",
			extra: "x",
		});
		expect(event).not.toHaveProperty("extra");
	});

	it.each([
		null,
		"string",
		42,
		{ method: "eval", type: "localStorage", key: "k", value: "v" },
		{ method: "setItem", type: "document", key: "k", value: "v" },
		{ method: "setItem", type: "__proto__", key: "k", value: "v" },
		{ method: "setItem", type: "localStorage", key: 1, value: "v" },
		{ method: "setItem", type: "localStorage", key: "k", value: { a: 1 } },
		{ method: "setItem", type: "localStorage", key: "k", value: null },
		{ method: "setItem", type: "localStorage", key: "k" },
		{
			method: "setItem",
			type: "localStorage",
			key: "k",
			value: "v",
			timestamp: "now",
		},
		{
			method: "setItem",
			type: "localStorage",
			key: "k",
			value: "v",
			timestamp: Number.NaN,
		},
	])("rejects %j", (raw) => {
		expect(parseStorageEvent(raw)).toBeNull();
	});
});

describe("isPageStorageType", () => {
	it("only allows the two web storages", () => {
		expect(isPageStorageType("localStorage")).toBe(true);
		expect(isPageStorageType("sessionStorage")).toBe(true);
		expect(isPageStorageType("indexedDB")).toBe(false);
		expect(isPageStorageType(undefined)).toBe(false);
	});
});
