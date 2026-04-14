import { calleeName } from "../utils.js";

import type { AnalysisRuleDefinition } from "./types.js";

const evalRule: AnalysisRuleDefinition = {
	internalRules: ["eval"],
	visitors: () => ({
		CallExpression(node, emit) {
			const name = calleeName(node.callee);
			if (name === "eval") {
				emit(
					"eval",
					"eval() call",
					"Remove or replace eval in the app; security and CSP risk.",
					node,
				);
			}
		},
	}),
};

export default evalRule;
