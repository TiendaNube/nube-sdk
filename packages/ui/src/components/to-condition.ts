import type {
	NubeCondition,
	NubeConditionOperators,
} from "@tiendanube/nube-sdk-types";

type Operator = keyof NubeConditionOperators;

const OPERATORS: readonly Operator[] = [
	"is",
	"oneOf",
	"gt",
	"gte",
	"lt",
	"lte",
	"startsWith",
	"endsWith",
	"includes",
	"condition",
];

/** A condition that is never true: an empty `or`. */
export const NEVER: NubeCondition = { op: "or", value: [] };

/**
 * Splits the props of a component into its operator, converted into a
 * `condition`, and every other prop.
 *
 * `condition` is undefined when no operator was passed. With more than one,
 * it warns and returns {@link NEVER}, so the branch never renders (the types
 * already reject that; this covers apps without TypeScript).
 */
export function toCondition<P extends object>(
	component: string,
	props: P,
): {
	condition: NubeCondition | undefined;
	rest: Omit<P, Operator>;
} {
	const rest = { ...props } as Record<string, unknown>;
	const found: Operator[] = [];
	for (const operator of OPERATORS) {
		if (rest[operator] !== undefined) found.push(operator);
		delete rest[operator];
	}

	if (found.length > 1) {
		console.warn(
			`[nube-sdk] ${component} takes a single operator, got ${found.join(", ")}; it never matches.`,
		);
		return { condition: NEVER, rest: rest as Omit<P, Operator> };
	}

	const [operator] = found;
	return {
		condition:
			operator === undefined
				? undefined
				: build(operator, (props as Record<string, unknown>)[operator]),
		rest: rest as Omit<P, Operator>,
	};
}

function build(operator: Operator, value: unknown): NubeCondition {
	switch (operator) {
		case "condition":
			return value as NubeCondition;
		default:
			return { op: operator, value } as NubeCondition;
	}
}
