import type * as acorn from "acorn";

import type { AnalysisWarning } from "./types.js";

export function locationFromNode(
	node: acorn.Node,
): AnalysisWarning["location"]["generated"] {
	const start = node.loc?.start;
	if (start) {
		return { line: start.line, column: start.column };
	}
	return null;
}

export function summaryByRule(
	warnings: AnalysisWarning[],
): Record<string, number> {
	const byRule: Record<string, number> = {};
	for (const w of warnings) {
		byRule[w.rule] = (byRule[w.rule] ?? 0) + 1;
	}
	return byRule;
}

export function stringifyUrlArg(node: acorn.Node | undefined): {
	kind: "none" | "literal" | "template" | "dynamic";
	value: string | null;
} {
	if (!node) return { kind: "none", value: null };
	if (node.type === "Literal") {
		const lit = node as acorn.Literal;
		if (typeof lit.value === "string") {
			return { kind: "literal", value: lit.value };
		}
	}
	if (node.type === "TemplateLiteral") {
		const tpl = node as acorn.TemplateLiteral;
		if (tpl.expressions.length === 0 && tpl.quasis[0]) {
			return {
				kind: "template",
				value: tpl.quasis[0].value.cooked ?? tpl.quasis[0].value.raw,
			};
		}
	}
	return { kind: "dynamic", value: null };
}

export function calleeName(callee: acorn.Node): string | null {
	if (callee.type === "Identifier") {
		return (callee as acorn.Identifier).name;
	}
	if (callee.type === "MemberExpression") {
		const mem = callee as acorn.MemberExpression;
		if (!mem.computed && mem.property.type === "Identifier") {
			return (mem.property as acorn.Identifier).name;
		}
	}
	return null;
}

export function truncate(s: string, max = 120): string {
	if (s.length <= max) return s;
	return `${s.slice(0, max)}…`;
}
