import type {
	AnalysisSeverity,
	AnalyzeRule,
	AnalyzeRuleType,
} from "./types.js";

const DEFAULT_FORBIDDEN_URL_MARKERS: readonly string[] = [
	"evil.com",
	"malware",
	"127.0.0.1:666",
	"metadata.google.internal",
];

const DEFAULT_SEVERITY_BY_RULE: Record<string, AnalysisSeverity> = {
	"dom-query": "error",
	"global-access": "error",
	eval: "error",
	"function-constructor": "error",
	"forbidden-fetch-url": "error",
	"dynamic-fetch-url": "warning",
	"import-scripts": "warning",
	xhr: "info",
	console: "info",
	"browser-storage": "warning",
};

const INTERNAL_RULE_TO_USER_TYPE: Record<string, AnalyzeRuleType> = {
	"forbidden-fetch-url": "fetch",
	"dynamic-fetch-url": "fetch",
	"import-scripts": "import-scripts",
	"dom-query": "dom-query",
	"global-access": "global-access",
	eval: "eval",
	"function-constructor": "function-constructor",
	xhr: "xhr",
	console: "console",
	"browser-storage": "browser-storage",
};

export type RuleRuntime =
	| {
			mode: "all";
			severityByType: Map<AnalyzeRuleType, AnalysisSeverity>;
			forbiddenUrlMarkers: string[];
	  }
	| {
			mode: "subset";
			enabledTypes: Set<AnalyzeRuleType>;
			severityByType: Map<AnalyzeRuleType, AnalysisSeverity>;
			forbiddenUrlMarkers: string[];
	  };

export function compileRules(
	rules: AnalyzeRule[],
	globalFetchMarkers?: string[],
): RuleRuntime {
	const severityByType = new Map<AnalyzeRuleType, AnalysisSeverity>();
	const defaultMarkers =
		globalFetchMarkers !== undefined && globalFetchMarkers.length > 0
			? [...globalFetchMarkers]
			: [...DEFAULT_FORBIDDEN_URL_MARKERS];

	if (rules.length === 0) {
		return {
			mode: "all",
			severityByType,
			forbiddenUrlMarkers: defaultMarkers,
		};
	}

	const enabledTypes = new Set<AnalyzeRuleType>();
	const fetchMarkers: string[] = [];
	let fetchMarkersExplicit = false;

	for (const r of rules) {
		enabledTypes.add(r.type);
		if (r.severity !== undefined) {
			severityByType.set(r.type, r.severity);
		}
		if (
			r.type === "fetch" &&
			r.forbiddenUrlMarkers !== undefined &&
			r.forbiddenUrlMarkers.length > 0
		) {
			fetchMarkers.push(...r.forbiddenUrlMarkers);
			fetchMarkersExplicit = true;
		}
	}

	const forbiddenUrlMarkers =
		fetchMarkersExplicit && fetchMarkers.length > 0
			? [...new Set(fetchMarkers)]
			: defaultMarkers;

	return { mode: "subset", enabledTypes, severityByType, forbiddenUrlMarkers };
}

function userTypeForInternalRule(internalRule: string): AnalyzeRuleType {
	return (
		INTERNAL_RULE_TO_USER_TYPE[internalRule] ??
		(internalRule as AnalyzeRuleType)
	);
}

export function isRuleEnabled(
	runtime: RuleRuntime,
	internalRule: string,
): boolean {
	if (runtime.mode === "all") return true;
	return runtime.enabledTypes.has(userTypeForInternalRule(internalRule));
}

export function severityForRule(
	runtime: RuleRuntime,
	internalRule: string,
): AnalysisSeverity {
	const userType = userTypeForInternalRule(internalRule);
	return (
		runtime.severityByType.get(userType) ??
		DEFAULT_SEVERITY_BY_RULE[internalRule] ??
		"warning"
	);
}
