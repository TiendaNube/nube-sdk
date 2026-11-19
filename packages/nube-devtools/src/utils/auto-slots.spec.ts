import { describe, expect, it } from "vitest";
import {
	AUTO_SLOT_OVERRIDES_GLOBAL,
	EMPTY_ENTRY,
	buildOverridesScript,
	entriesToOverrides,
	overridesScriptFilename,
	overridesToEntries,
	parseOverridesScript,
	parseStoredAutoSlots,
	validateEntries,
} from "./auto-slots";

const OVERRIDES = {
	after_header: { position: "disabled" as const },
	before_footer: { anchor: "footer", style: "margin-top: 8px" },
	custom_badge: {
		anchor: '[data-store="product-item-info-{id}"]',
		position: "afterbegin" as const,
		pick: "item" as const,
	},
};

describe("entries", () => {
	it("round-trips overrides", () => {
		expect(entriesToOverrides(overridesToEntries(OVERRIDES))).toEqual(
			OVERRIDES,
		);
	});

	it("leaves out empty fields and rows without a name, and trims", () => {
		expect(
			entriesToOverrides([
				{ ...EMPTY_ENTRY, slot: " before_footer ", anchor: " footer " },
				{ ...EMPTY_ENTRY, anchor: "ignored" },
			]),
		).toEqual({ before_footer: { anchor: "footer" } });
	});

	it("drops values the engine would ignore", () => {
		expect(
			overridesToEntries({ a: { position: "sideways", pick: 3, anchor: 1 } }),
		).toEqual([{ ...EMPTY_ENTRY, slot: "a" }]);
		expect(overridesToEntries("nope")).toEqual([]);
	});
});

describe("parseStoredAutoSlots", () => {
	it("defaults to off with no overrides", () => {
		expect(parseStoredAutoSlots(null)).toEqual({
			enabled: false,
			overrides: {},
		});
		expect(parseStoredAutoSlots("{not json")).toEqual({
			enabled: false,
			overrides: {},
		});
	});

	it("reads what the tab stores", () => {
		expect(
			parseStoredAutoSlots(
				JSON.stringify({ enabled: true, overrides: OVERRIDES }),
			),
		).toEqual({ enabled: true, overrides: OVERRIDES });
	});
});

describe("validateEntries", () => {
	it("flags rows without a name and duplicates", () => {
		const errors = validateEntries([
			{ ...EMPTY_ENTRY, slot: "after_header" },
			{ ...EMPTY_ENTRY },
			{ ...EMPTY_ENTRY, slot: "after_header " },
		]);
		expect([...errors.keys()]).toEqual([1, 2]);
	});
});

describe("buildOverridesScript", () => {
	it("sets the global the engine reads", () => {
		const script = buildOverridesScript(OVERRIDES, {
			host: "www.example.com",
			date: new Date("2026-11-03T12:00:00Z"),
		});
		expect(script).toContain("www.example.com");
		expect(script).toContain("2026-11-03");

		const page: Record<string, unknown> = {};
		new Function("window", script)(page);
		expect(page[AUTO_SLOT_OVERRIDES_GLOBAL]).toEqual(OVERRIDES);
	});

	it("can be inlined in a script tag", () => {
		const script = buildOverridesScript(
			{ a: { anchor: "</script><b>" } },
			{ host: "x", date: new Date() },
		);
		expect(script).not.toContain("</script>");

		const page: Record<string, unknown> = {};
		new Function("window", script)(page);
		expect(page[AUTO_SLOT_OVERRIDES_GLOBAL]).toEqual({
			a: { anchor: "</script><b>" },
		});
	});
});

describe("parseOverridesScript", () => {
	const script = buildOverridesScript(OVERRIDES, {
		host: "www.example.com",
		date: new Date("2026-11-03T12:00:00Z"),
	});

	it("reads back an exported script", () => {
		expect(parseOverridesScript(script)).toEqual(OVERRIDES);
	});

	it("reads back escaped values", () => {
		const escaped = buildOverridesScript(
			{ a: { anchor: "</script><b>" } },
			{ host: "x", date: new Date() },
		);
		expect(parseOverridesScript(escaped)).toEqual({
			a: { anchor: "</script><b>" },
		});
	});

	it("reads plain JSON", () => {
		expect(parseOverridesScript(JSON.stringify(OVERRIDES))).toEqual(OVERRIDES);
	});

	it("drops values the engine would ignore", () => {
		expect(
			parseOverridesScript('{"a":{"position":"sideways","anchor":"x"}}'),
		).toEqual({ a: { anchor: "x" } });
	});

	it("rejects anything that isn't data, without running it", () => {
		const page: Record<string, unknown> = {};
		Object.assign(globalThis, { __autoSlotsImportRan: page });
		for (const text of [
			"globalThis.__autoSlotsImportRan.ran = true;",
			`window.${AUTO_SLOT_OVERRIDES_GLOBAL} = (globalThis.__autoSlotsImportRan.ran = true, {});`,
			`window.${AUTO_SLOT_OVERRIDES_GLOBAL} = { a: { anchor: 'x' } };`,
			`window.${AUTO_SLOT_OVERRIDES_GLOBAL} = {"a":{}}; fetch("https://example.com");`,
			"not json",
			"[1]",
			"{}",
		]) {
			expect(parseOverridesScript(text)).toBeNull();
		}
		expect(page.ran).toBeUndefined();
	});
});

describe("overridesScriptFilename", () => {
	it("names the file after the store", () => {
		expect(overridesScriptFilename("www.example.com")).toBe(
			"nubesdk-auto-slot-overrides-www.example.com.js",
		);
		expect(overridesScriptFilename("")).toBe(
			"nubesdk-auto-slot-overrides-store.js",
		);
	});
});
