/**
 * Reads the conditions of `Show` and `Match.When`: the `{ op, value }` JSON
 * the predicates of `@tiendanube/nube-sdk-ui/predicates` build in the app and
 * the platform evaluates on the page.
 *
 * The panel evaluates them again, with the same rules, instead of asking the
 * page which branch it mounted. That costs the page nothing and lets the
 * panel say *why* a branch is or is not mounted. An operator this version
 * does not know is reported as such, never guessed.
 */

/** Same limits as the platform: deeper or larger conditions are invalid. */
export const MAX_CONDITION_DEPTH = 8;
export const MAX_CONDITION_NODES = 64;

/** The condition of a `Show` without one: "the value is `true`". */
export const IS_TRUE = { op: "is", value: true };

type Node = Record<string, unknown>;

/** One node of a condition, with its result for the value at hand. */
export type ConditionStep = {
	/** The node as the developer wrote it: `is "loading"`, `gte 18`, `and`... */
	label: string;
	matches: boolean;
	/** The operands of `and`, `or` and `not`. */
	children?: ConditionStep[];
};

export type ConditionOutcome = {
	/**
	 * Whether the condition can be read. The platform treats one it cannot
	 * read as not matching, and so does the panel.
	 */
	valid: boolean;
	matches: boolean;
	/** The whole condition on one line. */
	text: string;
	/** Why it matches or not. Missing when the condition is invalid. */
	steps?: ConditionStep;
};

function isPrimitive(value: unknown): boolean {
	return (
		value === null ||
		typeof value === "string" ||
		typeof value === "boolean" ||
		(typeof value === "number" && Number.isFinite(value))
	);
}

function isNode(value: unknown): value is Node {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isValidCondition(condition: unknown): boolean {
	let nodes = 0;

	function valid(value: unknown, depth: number): boolean {
		if (depth > MAX_CONDITION_DEPTH || ++nodes > MAX_CONDITION_NODES) {
			return false;
		}
		if (!isNode(value) || !("value" in value)) return false;
		const operand = value.value;

		switch (value.op) {
			case "is":
				return isPrimitive(operand);
			case "oneOf":
				return Array.isArray(operand) && operand.every(isPrimitive);
			case "gt":
			case "gte":
			case "lt":
			case "lte":
				return typeof operand === "number" && Number.isFinite(operand);
			case "startsWith":
			case "endsWith":
			case "includes":
				return typeof operand === "string";
			case "and":
			case "or":
				return (
					Array.isArray(operand) &&
					operand.every((item) => valid(item, depth + 1))
				);
			case "not":
				return valid(operand, depth + 1);
			default:
				return false;
		}
	}

	return valid(condition, 1);
}

/** A value the way it is written in code, shortened when it is long. */
export function formatValue(value: unknown, max = 60): string {
	if (value === undefined) return "undefined";
	let text: string;
	try {
		text = JSON.stringify(value) ?? String(value);
	} catch {
		text = String(value);
	}
	return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

/**
 * A condition on one line, close to the predicate call that built it:
 * `is "loading"`, `oneOf ["error","timeout"]`, `or(startsWith "01", gte 18)`.
 * Tolerates anything, since it is also what an invalid condition is shown
 * with.
 */
export function formatCondition(condition: unknown, depth = 0): string {
	if (!isNode(condition) || typeof condition.op !== "string") {
		return formatValue(condition);
	}
	if (depth > MAX_CONDITION_DEPTH) return "…";

	const { op, value } = condition;
	if ((op === "and" || op === "or") && Array.isArray(value)) {
		return `${op}(${value
			.map((item) => formatCondition(item, depth + 1))
			.join(", ")})`;
	}
	if (op === "not") return `not(${formatCondition(value, depth + 1)})`;
	return `${op} ${formatValue(value)}`;
}

/** Evaluates a condition already checked by {@link isValidCondition}. */
function step(condition: Node, value: unknown): ConditionStep {
	const operand = condition.value;
	const leaf = (matches: boolean): ConditionStep => ({
		label: formatCondition(condition),
		matches,
	});

	switch (condition.op) {
		case "is":
			return leaf(Object.is(value, operand));
		case "oneOf":
			return leaf(
				(operand as unknown[]).some((item) => Object.is(value, item)),
			);
		case "gt":
			return leaf(typeof value === "number" && value > (operand as number));
		case "gte":
			return leaf(typeof value === "number" && value >= (operand as number));
		case "lt":
			return leaf(typeof value === "number" && value < (operand as number));
		case "lte":
			return leaf(typeof value === "number" && value <= (operand as number));
		case "startsWith":
			return leaf(
				typeof value === "string" && value.startsWith(operand as string),
			);
		case "endsWith":
			return leaf(
				typeof value === "string" && value.endsWith(operand as string),
			);
		case "includes":
			return leaf(
				typeof value === "string" && value.includes(operand as string),
			);
		case "and": {
			const children = (operand as Node[]).map((item) => step(item, value));
			return {
				label: "and",
				matches: children.every((child) => child.matches),
				children,
			};
		}
		case "or": {
			const children = (operand as Node[]).map((item) => step(item, value));
			return {
				label: "or",
				matches: children.some((child) => child.matches),
				children,
			};
		}
		case "not": {
			const child = step(operand as Node, value);
			return { label: "not", matches: !child.matches, children: [child] };
		}
		default:
			return leaf(false);
	}
}

/**
 * Evaluates `condition` against the value of a signal, the way the platform
 * does: values are never converted (`"10"` is not greater than `5`), an
 * operator of numbers or strings is `false` for any other type, and a
 * condition that cannot be read does not match.
 */
export function explainCondition(
	condition: unknown,
	value: unknown,
): ConditionOutcome {
	const text = formatCondition(condition);
	if (!isValidCondition(condition)) {
		return { valid: false, matches: false, text };
	}
	const steps = step(condition as Node, value);
	return { valid: true, matches: steps.matches, text, steps };
}
