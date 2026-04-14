import type { AnalysisRuleDefinition } from "./types.js";

const consoleRule: AnalysisRuleDefinition = {
	internalRules: ["console"],
	visitors: () => ({
		CallExpression(node, emit) {
			const callee = node.callee;
			if (
				callee.type === "MemberExpression" &&
				callee.object.type === "Identifier" &&
				callee.object.name === "console"
			) {
				const prop =
					!callee.computed && callee.property.type === "Identifier"
						? callee.property.name
						: callee.computed
							? "[computed]"
							: "?";
				emit(
					"console",
					`console.${prop}()`,
					"Strip or guard console usage in the app bundle for production.",
					node,
				);
			}
		},
	}),
};

export default consoleRule;
