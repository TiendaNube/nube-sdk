import type { AnalysisRuleDefinition } from "./types.js";

const BROWSER_STORAGE_GLOBALS = new Set(["localStorage", "sessionStorage"]);

const browserStorageRule: AnalysisRuleDefinition = {
	internalRules: ["browser-storage"],
	visitors: () => ({
		MemberExpression(node, emit) {
			if (node.object.type !== "Identifier") return;
			const obj = node.object.name;
			if (!BROWSER_STORAGE_GLOBALS.has(obj)) return;

			const prop =
				!node.computed && node.property.type === "Identifier"
					? node.property.name
					: node.computed
						? "[computed]"
						: "?";
			emit(
				"browser-storage",
				`Access ${obj}.${prop}`,
				`Direct ${obj} access is not available; use nube.getBrowserAPIs() from NubeSDK instead.`,
				node,
			);
		},
	}),
};

export default browserStorageRule;
