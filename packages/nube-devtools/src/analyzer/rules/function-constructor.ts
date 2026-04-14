import { calleeName } from "../utils.js";

import type { AnalysisRuleDefinition } from "./types.js";

const functionConstructorRule: AnalysisRuleDefinition = {
	internalRules: ["function-constructor"],
	visitors: () => ({
		CallExpression(node, emit) {
			const name = calleeName(node.callee);
			if (name === "Function" && node.callee.type === "Identifier") {
				emit(
					"function-constructor",
					"Function constructor (similar risk profile to eval).",
					null,
					node,
				);
			}
		},
	}),
};

export default functionConstructorRule;
