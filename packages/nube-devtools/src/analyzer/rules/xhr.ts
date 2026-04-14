import type { AnalysisRuleDefinition } from "./types.js";

const xhrRule: AnalysisRuleDefinition = {
	internalRules: ["xhr"],
	visitors: () => ({
		NewExpression(node, emit) {
			const callee = node.callee;
			if (callee.type === "Identifier" && callee.name === "XMLHttpRequest") {
				emit(
					"xhr",
					"new XMLHttpRequest()",
					"Review request URLs in the app the same way as fetch.",
					node,
				);
			}
		},
	}),
};

export default xhrRule;
