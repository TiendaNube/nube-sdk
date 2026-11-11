import type { NubeSignalPrimitive } from "./signals";

/**
 * A value a condition compares: JSON primitives, compared with `Object.is`.
 */
export type NubeConditionValue = NubeSignalPrimitive;

/**
 * Carries the type of value a condition applies to, so `and(gt(1),
 * startsWith("a"))` fails to compile. It only exists in the types: the JSON
 * sent to the platform never has `__value`.
 */
type ConditionOf<T> = { readonly __value?: T };

/**
 * One node of a condition: an operator and its operand. Every condition has
 * this shape, whatever the operator: `{ op: "gte", value: 90 }`,
 * `{ op: "and", value: [...] }`, `{ op: "not", value: {...} }`.
 */
export interface NubeConditionNode<Op extends string, V> {
	op: Op;
	value: V;
}

/**
 * A condition, as JSON the platform evaluates against the value of a signal.
 * Build it with the predicates (`is`, `gte`, `and`…) instead of writing it by
 * hand.
 *
 * Every node is `{ op, value }`:
 * - `is` / `oneOf`: `Object.is` against one value or any of a list;
 * - `gt` / `gte` / `lt` / `lte`: numbers only; any other value is `false`;
 * - `startsWith` / `endsWith` / `includes`: strings only; any other value is
 *   `false`;
 * - `and` / `or`: `value` is a list of conditions. An empty `and` is `true`,
 *   an empty `or` is `false`;
 * - `not`: `value` is one condition.
 *
 * Values are never converted: `"10"` is not greater than `5`. A condition the
 * platform cannot read (an unknown `op`, a missing `value`, more than 8 levels
 * or 64 nodes) is `false`.
 */
export type NubeCondition<T extends NubeConditionValue = NubeConditionValue> = (
	| NubeConditionNode<"is", NubeConditionValue>
	| NubeConditionNode<"oneOf", NubeConditionValue[]>
	| NubeConditionNode<"gt" | "gte" | "lt" | "lte", number>
	| NubeConditionNode<"startsWith" | "endsWith" | "includes", string>
	| NubeConditionNode<"and" | "or", NubeCondition[]>
	| NubeConditionNode<"not", NubeCondition>
) &
	ConditionOf<T>;

/** The operator of a condition. */
export type NubeConditionOperator = NubeCondition["op"];

/** Operators any value takes. */
type ValueOperators<T extends NubeConditionValue> = {
	/** Matches when the value is this one (`Object.is`). */
	is: NoInfer<T>;
	/** Matches when the value is any of these (`Object.is`). */
	oneOf: NoInfer<T>[];
	/** Matches when this condition is true for the value. */
	condition: NubeCondition<NoInfer<T>>;
};

/** Operators for numbers. Any other value does not match. */
type NumberOperators = {
	/** Matches numbers greater than this one. */
	gt: number;
	/** Matches numbers greater than or equal to this one. */
	gte: number;
	/** Matches numbers less than this one. */
	lt: number;
	/** Matches numbers less than or equal to this one. */
	lte: number;
};

/** Operators for strings. Any other value does not match. */
type StringOperators = {
	/** Matches strings that start with this one. */
	startsWith: string;
	/** Matches strings that end with this one. */
	endsWith: string;
	/** Matches strings that contain this one. */
	includes: string;
};

/**
 * Every operator a component takes in place of a `condition`, such as
 * `<Match.When gte={90}>`.
 */
export type NubeConditionOperators<
	T extends NubeConditionValue = NubeConditionValue,
> = ValueOperators<T> & NumberOperators & StringOperators;

/**
 * The operators that make sense for values of type `T`: numeric operators
 * only for numbers, text operators only for strings.
 */
export type NubeConditionOperatorsFor<T extends NubeConditionValue> =
	ValueOperators<T> &
		([T] extends [number] ? NumberOperators : unknown) &
		([T] extends [string] ? StringOperators : unknown);

/**
 * Exactly one key of `T`: the others become `never`, so passing two of them,
 * or none, fails to compile.
 */
export type NubeExactlyOne<T> = {
	[K in keyof T]: { [P in K]: T[P] } & {
		[P in Exclude<keyof T, K>]?: never;
	};
}[keyof T];

/** No key of `T` may be passed. */
export type NubeNoneOf<T> = { [P in keyof T]?: never };
