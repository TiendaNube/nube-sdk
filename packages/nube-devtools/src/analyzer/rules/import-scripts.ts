import { calleeName, stringifyUrlArg, truncate } from "../utils.js";

import type { AnalysisRuleDefinition } from "./types.js";

const importScriptsRule: AnalysisRuleDefinition = {
	internalRules: ["import-scripts"],
	visitors: () => ({
		CallExpression(node, emit) {
			const name = calleeName(node.callee);
			if (name !== "importScripts") return;

			const arg0 = node.arguments[0];
			const u = stringifyUrlArg(
				arg0 && arg0.type !== "SpreadElement" ? arg0 : undefined,
			);
			const desc =
				u.kind === "literal" || u.kind === "template"
					? `importScripts("${truncate(u.value ?? "")}")`
					: "importScripts() with non-literal URL";
			emit(
				"import-scripts",
				desc,
				"Ensure the app only loads trusted scripts via importScripts.",
				node,
			);
		},
	}),
};

export default importScriptsRule;
