import { describe, expect, it } from "vitest";
import {
	IS_TRUE,
	MAX_CONDITION_DEPTH,
	explainCondition,
	formatCondition,
	formatValue,
} from "./conditions";

/**
 * `[condition, value, matches]`, the same cases the platform's evaluator is
 * tested with: the panel must agree with what the page mounts.
 */
const CASES: [unknown, unknown, boolean][] = [
	[{ op: "is", value: "a" }, "a", true],
	[{ op: "is", value: "a" }, "b", false],
	[{ op: "is", value: 1 }, "1", false],
	[{ op: "is", value: null }, null, true],
	[{ op: "is", value: null }, undefined, false],
	[IS_TRUE, true, true],
	[IS_TRUE, 1, false],
	[{ op: "oneOf", value: ["error", "timeout"] }, "timeout", true],
	[{ op: "oneOf", value: ["error", "timeout"] }, "idle", false],
	[{ op: "oneOf", value: [] }, "idle", false],
	[{ op: "gt", value: 5 }, 6, true],
	[{ op: "gt", value: 5 }, 5, false],
	[{ op: "gt", value: 5 }, "10", false],
	[{ op: "gte", value: 5 }, 5, true],
	[{ op: "lt", value: 5 }, 4, true],
	[{ op: "lte", value: 5 }, 6, false],
	[{ op: "startsWith", value: "01" }, "01310", true],
	[{ op: "startsWith", value: "01" }, 1310, false],
	[{ op: "endsWith", value: "0" }, "01310", true],
	[{ op: "includes", value: "31" }, "01310", true],
	[
		{
			op: "and",
			value: [
				{ op: "gte", value: 1 },
				{ op: "lt", value: 3 },
			],
		},
		2,
		true,
	],
	[
		{
			op: "and",
			value: [
				{ op: "gte", value: 1 },
				{ op: "lt", value: 3 },
			],
		},
		3,
		false,
	],
	[{ op: "and", value: [] }, "anything", true],
	[{ op: "or", value: [] }, "anything", false],
	[
		{
			op: "or",
			value: [
				{ op: "is", value: "a" },
				{ op: "is", value: "b" },
			],
		},
		"b",
		true,
	],
	[{ op: "not", value: { op: "is", value: "a" } }, "b", true],
	[{ op: "not", value: { op: "is", value: "a" } }, "a", false],
];

describe("explainCondition", () => {
	it.each(CASES)("%j against %j is %s", (condition, value, matches) => {
		expect(explainCondition(condition, value)).toMatchObject({
			valid: true,
			matches,
		});
	});

	it.each([
		[{ op: "unknown", value: 1 }],
		[{ op: "is" }],
		[{ op: "is", value: { a: 1 } }],
		[{ op: "gt", value: "5" }],
		[{ op: "oneOf", value: "a" }],
		[{ op: "and", value: [{ op: "unknown", value: 1 }] }],
		["is"],
		[null],
		[undefined],
	])("treats %j as invalid and not matching", (condition) => {
		expect(explainCondition(condition, true)).toMatchObject({
			valid: false,
			matches: false,
		});
	});

	it("rejects a condition nested too deep", () => {
		let condition: unknown = { op: "is", value: true };
		for (let depth = 0; depth < MAX_CONDITION_DEPTH; depth++) {
			condition = { op: "not", value: condition };
		}
		expect(explainCondition(condition, true).valid).toBe(false);
	});

	it("says which operands matched", () => {
		const outcome = explainCondition(
			{
				op: "or",
				value: [
					{ op: "startsWith", value: "01" },
					{ op: "not", value: { op: "is", value: "x" } },
				],
			},
			"02000",
		);

		expect(outcome.steps).toEqual({
			label: "or",
			matches: true,
			children: [
				{ label: 'startsWith "01"', matches: false },
				{
					label: "not",
					matches: true,
					children: [{ label: 'is "x"', matches: false }],
				},
			],
		});
	});
});

describe("formatCondition", () => {
	it("reads like the predicate that built it", () => {
		expect(formatCondition({ op: "is", value: "loading" })).toBe(
			'is "loading"',
		);
		expect(formatCondition({ op: "oneOf", value: ["error", "timeout"] })).toBe(
			'oneOf ["error","timeout"]',
		);
		expect(
			formatCondition({
				op: "or",
				value: [
					{ op: "gte", value: 18 },
					{ op: "not", value: { op: "is", value: null } },
				],
			}),
		).toBe("or(gte 18, not(is null))");
	});

	it("shows what it cannot read as it is", () => {
		expect(formatCondition("nope")).toBe('"nope"');
		expect(formatCondition({ op: "unknown", value: 1 })).toBe("unknown 1");
	});
});

describe("formatValue", () => {
	it("formats values as code and shortens long ones", () => {
		expect(formatValue(undefined)).toBe("undefined");
		expect(formatValue("a")).toBe('"a"');
		expect(formatValue({ a: 1 })).toBe('{"a":1}');
		expect(formatValue("x".repeat(100), 10)).toHaveLength(10);
	});
});
