import type {
	NubeComponentMatchValueProps,
	NubeComponentMatchWhenProps,
	NubeComponentShowProps,
	NubeCondition,
	NubeSignalReference,
} from "@tiendanube/nube-sdk-types";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
	and,
	endsWith,
	gt,
	gte,
	includes,
	is,
	lt,
	lte,
	not,
	oneOf,
	or,
	startsWith,
} from "../predicates";
import { box } from "./box";
import { matchDefault } from "./match-default";
import { matchValue } from "./match-value";
import { matchWhen } from "./match-when";
import { show } from "./show";

function reference<T>(
	initialValue: T,
	id = "signal-test-app-id-1",
): NubeSignalReference<T> {
	return { type: "signal", __internalId: id, initialValue };
}

/** Checks `value` against `T`. The cases are only checked by `tsc`. */
const typed = <T>(value: T) => value;

const json = (value: unknown) => JSON.parse(JSON.stringify(value));

afterEach(() => {
	vi.restoreAllMocks();
});

describe("predicates", () => {
	it("build the JSON of each operator", () => {
		expect(is("idle")).toEqual({ op: "is", value: "idle" });
		expect(is(null)).toEqual({ op: "is", value: null });
		expect(oneOf(["error", "timeout"])).toEqual({
			op: "oneOf",
			value: ["error", "timeout"],
		});
		expect(gt(1)).toEqual({ op: "gt", value: 1 });
		expect(gte(1)).toEqual({ op: "gte", value: 1 });
		expect(lt(1)).toEqual({ op: "lt", value: 1 });
		expect(lte(1)).toEqual({ op: "lte", value: 1 });
		expect(startsWith("01")).toEqual({ op: "startsWith", value: "01" });
		expect(endsWith("x")).toEqual({ op: "endsWith", value: "x" });
		expect(includes("x")).toEqual({ op: "includes", value: "x" });
	});

	it("compose conditions", () => {
		expect(and(gte(90), not(is(100)))).toEqual({
			op: "and",
			value: [
				{ op: "gte", value: 90 },
				{ op: "not", value: { op: "is", value: 100 } },
			],
		});
		expect(or()).toEqual({ op: "or", value: [] });
	});

	it("copy the list of oneOf", () => {
		const values = ["a", "b"];
		const condition = oneOf(values);
		values.push("c");
		expect(condition.value).toEqual(["a", "b"]);
	});

	it("always have the shape { op, value }", () => {
		const nodes: unknown[] = [];
		(function walk(node: unknown) {
			nodes.push(node);
			const { value } = node as { value: unknown };
			if (Array.isArray(value)) {
				for (const item of value) if (typeof item === "object") walk(item);
			} else if (typeof value === "object" && value !== null) walk(value);
		})(and(or(lt(0), gt(100)), not(oneOf([1, 2])), startsWith("a") as never));
		for (const node of nodes) {
			expect(Object.keys(node as object).sort()).toEqual(["op", "value"]);
		}
	});

	it("survive JSON as they are", () => {
		const condition = and(or(lt(0), gt(100)), not(oneOf([1, 2])));
		expect(json(condition)).toEqual(condition);
	});

	it("keep the type of value they apply to", () => {
		typed<NubeCondition<number>>(and(gt(1), lt(5)));
		typed<NubeCondition<string>>(or(startsWith("a"), endsWith("b")));
		typed<NubeCondition<"a" | "b">>(oneOf(["a", "b"]));
		// @ts-expect-error mixes numbers and strings
		and(gt(1), startsWith("a"));
		// @ts-expect-error `gt` takes a number
		gt("1");
	});
});

describe("show", () => {
	it("carries the signal, the children and the fallback, without condition", () => {
		const when = reference(true);
		const fallback = box({ children: "login" });
		const tree = json(show({ when, fallback, children: "dashboard" }));

		expect(tree.type).toBe("show");
		expect(tree.when).toEqual(when);
		expect(tree.fallback).toEqual(json(fallback));
		expect(tree.children).toBe("dashboard");
		expect(tree).not.toHaveProperty("condition");
		expect(tree.__internalId).toMatch(/^show-test-app-id-[a-z0-9]+$/);
	});

	it("sends an operator as a condition", () => {
		const tree = json(show({ when: reference(0), gte: 90 }));
		expect(tree.condition).toEqual({ op: "gte", value: 90 });
		expect(tree).not.toHaveProperty("gte");
	});

	it("sends `condition` as it is", () => {
		const condition = or(startsWith("01"), startsWith("02"));
		const tree = json(show({ when: reference(""), condition }));
		expect(tree.condition).toEqual(condition);
	});

	it("never shows children with two operators", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const node = show({
			when: reference(0),
			...({ gt: 1, lt: 5 } as { gt: number }),
		});
		expect(node.condition).toEqual({ op: "or", value: [] });
		expect(warn).toHaveBeenCalledTimes(1);
	});

	it("has the same id when only the value of the signal changes", () => {
		const before = show({ when: reference(true), children: "a" });
		const after = show({ when: reference(false), children: "a" });
		expect(before.__internalId).toBe(after.__internalId);
	});

	it("has different ids for different signals or conditions", () => {
		const a = show({ when: reference(true, "signal-test-app-id-1") });
		const b = show({ when: reference(true, "signal-test-app-id-2") });
		const c = show({ when: reference(1), gt: 1 });
		const d = show({ when: reference(1), gt: 2 });
		expect(a.__internalId).not.toBe(b.__internalId);
		expect(c.__internalId).not.toBe(d.__internalId);
	});

	it("checks the operator against the type of the signal", () => {
		typed<NubeComponentShowProps>({ when: reference(true) });
		typed<NubeComponentShowProps<number>>({ when: reference(1), gte: 90 });
		typed<NubeComponentShowProps<string>>({
			when: reference(""),
			startsWith: "01",
		});
		typed<NubeComponentShowProps<"free" | "pro">>({
			when: reference<"free" | "pro">("free"),
			oneOf: ["pro"],
		});
		typed<NubeComponentShowProps<number>>({
			when: reference(1),
			condition: and(gte(1), lte(5)),
		});
		// @ts-expect-error a fixed value is not reactive
		typed<NubeComponentShowProps>({ when: true });
		// @ts-expect-error without an operator, `when` is a boolean signal
		typed<NubeComponentShowProps<number>>({ when: reference(1) });
		typed<NubeComponentShowProps<number>>({
			when: reference(1),
			// @ts-expect-error text operators take a signal of a string
			startsWith: "9",
		});
		typed<NubeComponentShowProps<"free" | "pro">>({
			when: reference<"free" | "pro">("free"),
			// @ts-expect-error "basic" is not a value of the signal
			oneOf: ["basic"],
		});
		typed<NubeComponentShowProps<number>>({
			when: reference(1),
			// @ts-expect-error the condition is about strings
			condition: startsWith("a"),
		});
		// @ts-expect-error a single operator
		typed<NubeComponentShowProps<number>>({ when: reference(1), gt: 1, lt: 5 });
	});
});

describe("matchValue", () => {
	it("carries the signal and the branches in the tree", () => {
		const of = reference<string>("idle");
		const tree = json(
			matchValue({
				of,
				children: [
					matchWhen({ is: "idle", children: "idle" }),
					matchWhen({ oneOf: ["error", "timeout"], children: "error" }),
					matchDefault({ children: "unknown" }),
				],
			}),
		);

		expect(tree.type).toBe("matchValue");
		expect(tree.of).toEqual(of);
		expect(tree.children.map((child: { type: string }) => child.type)).toEqual([
			"matchWhen",
			"matchWhen",
			"matchDefault",
		]);
	});

	it("has the same id when only the value of the signal changes", () => {
		const before = matchValue({ of: reference<string>("idle") });
		const after = matchValue({ of: reference<string>("loading") });
		expect(before.__internalId).toBe(after.__internalId);
	});

	it("warns about children that are not branches", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		matchValue({ of: reference(1), children: [box({}), "text"] });
		expect(warn).toHaveBeenCalledTimes(2);
	});

	it("warns about a second default", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		matchValue({
			of: reference(1),
			children: [matchDefault({}), matchDefault({})],
		});
		expect(warn).toHaveBeenCalledTimes(1);
	});

	it("only takes a signal of a primitive in `of`", () => {
		typed<NubeComponentMatchValueProps>({ of: reference<string | null>(null) });
		// @ts-expect-error a fixed value is not reactive
		typed<NubeComponentMatchValueProps>({ of: "idle" });
		// @ts-expect-error objects are not compared
		typed<NubeComponentMatchValueProps>({ of: reference({ a: 1 }) });
	});
});

describe("matchWhen", () => {
	it.each([
		[{ is: "idle" }, { op: "is", value: "idle" }],
		[{ is: null }, { op: "is", value: null }],
		[{ oneOf: ["a", "b"] }, { op: "oneOf", value: ["a", "b"] }],
		[{ gt: 1 }, { op: "gt", value: 1 }],
		[{ gte: 1 }, { op: "gte", value: 1 }],
		[{ lt: 1 }, { op: "lt", value: 1 }],
		[{ lte: 1 }, { op: "lte", value: 1 }],
		[{ startsWith: "01" }, { op: "startsWith", value: "01" }],
		[{ endsWith: "x" }, { op: "endsWith", value: "x" }],
		[{ includes: "x" }, { op: "includes", value: "x" }],
		[{ condition: and(gte(90), lte(100)) }, and(gte(90), lte(100))],
	])("sends %j as a condition", (props, condition) => {
		const tree = json(
			matchWhen({ ...(props as NubeComponentMatchWhenProps), children: "x" }),
		);
		expect(tree.condition).toEqual(condition);
		expect(Object.keys(tree).sort()).toEqual(
			["__internalId", "children", "condition", "type"].sort(),
		);
	});

	it("never matches without an operator, or with two", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const never = { op: "or", value: [] };
		expect(matchWhen({} as NubeComponentMatchWhenProps).condition).toEqual(
			never,
		);
		expect(
			matchWhen({ is: 1, gt: 2 } as unknown as NubeComponentMatchWhenProps)
				.condition,
		).toEqual(never);
		expect(warn).toHaveBeenCalledTimes(2);
	});

	it("has different ids for different conditions", () => {
		expect(matchWhen({ is: 1 }).__internalId).not.toBe(
			matchWhen({ is: 2 }).__internalId,
		);
	});

	it("takes exactly one operator", () => {
		typed<NubeComponentMatchWhenProps>({ is: "idle" });
		typed<NubeComponentMatchWhenProps>({ oneOf: ["error", "timeout"] });
		typed<NubeComponentMatchWhenProps>({ gte: 90 });
		typed<NubeComponentMatchWhenProps>({ startsWith: "01" });
		typed<NubeComponentMatchWhenProps>({ condition: or(lt(0), gt(100)) });
		// @ts-expect-error two operators
		typed<NubeComponentMatchWhenProps>({ is: "idle", gt: 1 });
		// @ts-expect-error no operator
		typed<NubeComponentMatchWhenProps>({});
		// @ts-expect-error `gt` takes a number
		typed<NubeComponentMatchWhenProps>({ gt: "10" });
	});
});
