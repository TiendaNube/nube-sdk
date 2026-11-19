/**
 * @fileoverview Predicates: pure functions that build the JSON of a
 * condition, for `condition` in `matchWhen` and `show` (`Match.When` and
 * `Show` in JSX).
 *
 * Imported from `@tiendanube/nube-sdk-ui/predicates` (or
 * `@tiendanube/nube-sdk-jsx/predicates`), not from the main entry point, so
 * short names such as `and`, `not` or `is` do not clash with names in the app.
 *
 * They only create data. The platform evaluates the condition against the
 * value of the signal on the page; no code of the app runs there.
 *
 * ```tsx
 * <Match.When condition={and(gte(90), lte(100))}><Excellent /></Match.When>
 * ```
 */

import type {
	NubeCondition,
	NubeConditionValue,
} from "@tiendanube/nube-sdk-types";

/** True when the value is `value` (`Object.is`). */
export const is = <const T extends NubeConditionValue>(
	value: T,
): NubeCondition<T> => ({ op: "is", value });

/** True when the value is any of `values` (`Object.is`). */
export const oneOf = <const T extends NubeConditionValue>(
	values: readonly T[],
): NubeCondition<T> => ({ op: "oneOf", value: [...values] });

/** True for numbers greater than `value`. */
export const gt = (value: number): NubeCondition<number> => ({
	op: "gt",
	value,
});

/** True for numbers greater than or equal to `value`. */
export const gte = (value: number): NubeCondition<number> => ({
	op: "gte",
	value,
});

/** True for numbers less than `value`. */
export const lt = (value: number): NubeCondition<number> => ({
	op: "lt",
	value,
});

/** True for numbers less than or equal to `value`. */
export const lte = (value: number): NubeCondition<number> => ({
	op: "lte",
	value,
});

/** True for strings that start with `value`. */
export const startsWith = (value: string): NubeCondition<string> => ({
	op: "startsWith",
	value,
});

/** True for strings that end with `value`. */
export const endsWith = (value: string): NubeCondition<string> => ({
	op: "endsWith",
	value,
});

/** True for strings that contain `value`. */
export const includes = (value: string): NubeCondition<string> => ({
	op: "includes",
	value,
});

/** True when every condition is true. `and()` is `true`. */
export const and = <T extends NubeConditionValue>(
	...conditions: NubeCondition<T>[]
): NubeCondition<T> => ({ op: "and", value: conditions });

/** True when any condition is true. `or()` is `false`. */
export const or = <T extends NubeConditionValue>(
	...conditions: NubeCondition<T>[]
): NubeCondition<T> => ({ op: "or", value: conditions });

/** True when `condition` is false. */
export const not = <T extends NubeConditionValue>(
	condition: NubeCondition<T>,
): NubeCondition<T> => ({ op: "not", value: condition });
