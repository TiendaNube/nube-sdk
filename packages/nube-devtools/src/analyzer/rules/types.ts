import type * as acorn from "acorn";

export type EmitFn = (
	internalRule: string,
	message: string,
	appHint: string | null,
	node: acorn.Node,
) => void;

export interface RuleContext {
	forbiddenUrlMarkers: string[];
}

export interface RuleVisitors {
	CallExpression?: (node: acorn.CallExpression, emit: EmitFn) => void;
	MemberExpression?: (node: acorn.MemberExpression, emit: EmitFn) => void;
	NewExpression?: (node: acorn.NewExpression, emit: EmitFn) => void;
}

export interface AnalysisRuleDefinition {
	internalRules: string[];
	visitors: (ctx: RuleContext) => RuleVisitors;
}
