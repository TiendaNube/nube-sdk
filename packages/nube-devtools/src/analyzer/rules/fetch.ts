import { calleeName, stringifyUrlArg, truncate } from "../utils.js";

import type { AnalysisRuleDefinition } from "./types.js";

const fetchRule: AnalysisRuleDefinition = {
	internalRules: ["forbidden-fetch-url", "dynamic-fetch-url"],
	visitors: (ctx) => ({
		CallExpression(node, emit) {
			const name = calleeName(node.callee);
			if (name !== "fetch") return;

			const arg0 = node.arguments[0];
			const urlInfo = stringifyUrlArg(
				arg0 && arg0.type !== "SpreadElement" ? arg0 : undefined,
			);

			if (urlInfo.kind === "literal" || urlInfo.kind === "template") {
				const u = urlInfo.value ?? "";
				for (const marker of ctx.forbiddenUrlMarkers) {
					if (marker && u.includes(marker)) {
						emit(
							"forbidden-fetch-url",
							`fetch() URL matches marker "${marker}": ${truncate(u)}`,
							"Review allowlists; malicious or unintended app code can still exfiltrate via fetch.",
							node,
						);
					}
				}
			} else if (urlInfo.kind === "dynamic") {
				emit(
					"dynamic-fetch-url",
					"fetch() URL is not a static string — cannot verify destination.",
					"Have the app verify dynamic destinations at runtime or enforce a URL policy.",
					node,
				);
			}
		},
	}),
};

export default fetchRule;
