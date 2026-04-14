import type { AnalysisRuleDefinition } from "./types.js";

const WORKER_RISKY_GLOBALS = new Set([
	"window",
	"document",
	"parent",
	"frames",
	"frameElement",
]);

const globalAccessRule: AnalysisRuleDefinition = {
	internalRules: ["global-access"],
	visitors: () => ({
		MemberExpression(node, emit) {
			if (node.object.type !== "Identifier") return;
			const obj = node.object.name;
			if (!WORKER_RISKY_GLOBALS.has(obj)) return;

			const prop =
				!node.computed && node.property.type === "Identifier"
					? node.property.name
					: node.computed
						? "[computed]"
						: "?";
			emit(
				"global-access",
				`Access ${obj}.${prop}`,
				obj === "window" || obj === "document"
					? "Not on dedicated WorkerGlobalScope; use self/globalThis or remove from the app bundle."
					: "Behavior may differ; remove from the app if this access is unintended.",
				node,
			);
		},
	}),
};

export default globalAccessRule;
