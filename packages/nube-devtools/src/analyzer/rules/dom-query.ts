import { calleeName } from "../utils.js";

import type { AnalysisRuleDefinition } from "./types.js";

const DOM_QUERY_METHODS = new Set([
	"querySelector",
	"querySelectorAll",
	"getElementById",
	"getElementsByClassName",
	"getElementsByTagName",
	"getElementsByName",
]);

const domQueryRule: AnalysisRuleDefinition = {
	internalRules: ["dom-query"],
	visitors: () => ({
		CallExpression(node, emit) {
			const name = calleeName(node.callee);
			if (name && DOM_QUERY_METHODS.has(name)) {
				emit(
					"dom-query",
					`Call to ${name}()`,
					"No DOM in this context; remove misplaced code from the app or it may throw at runtime.",
					node,
				);
			}
		},
	}),
};

export default domQueryRule;
