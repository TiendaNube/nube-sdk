export type AnalysisSeverity = "error" | "warning" | "info";

/** High-level rule kinds passed to `analyze`. */
export type AnalyzeRuleType =
	| "fetch"
	| "import-scripts"
	| "dom-query"
	| "global-access"
	| "eval"
	| "function-constructor"
	| "xhr"
	| "console"
	| "browser-storage";

export interface AnalyzeRule {
	type: AnalyzeRuleType;
	severity?: AnalysisSeverity;
	/**
	 * For `type: "fetch"` only: substrings matched against literal/template `fetch()` URLs.
	 * If omitted, default markers from the analyzer are used.
	 */
	forbiddenUrlMarkers?: string[];
}

export interface AnalyzeParams {
	url: string;
	/**
	 * Rules to run. Each entry enables that category and optionally sets severity.
	 * If empty, all built-in checks run with default severities.
	 */
	rules: AnalyzeRule[];
	/**
	 * Global fetch URL markers when no `fetch` rule supplies `forbiddenUrlMarkers`.
	 * Useful for env-based CLI overrides.
	 */
	forbiddenUrlMarkers?: string[];
	sourceMap?: string | Record<string, unknown>;
	resolveInlineSourceMap?: boolean;
}

export interface GeneratedPosition {
	line: number;
	column: number;
}

export interface OriginalPosition {
	source: string;
	line: number;
	column: number;
}

export interface AnalysisLocation {
	generated: GeneratedPosition | null;
	original: OriginalPosition | null;
}

export interface AnalysisWarning {
	id: string;
	rule: string;
	message: string;
	severity: AnalysisSeverity;
	location: AnalysisLocation;
	hints: { app?: string } | null;
}

export interface AnalysisSummary {
	totalWarnings: number;
	byRule: Record<string, number>;
}

export interface AnalysisBundleOk {
	url: string | null;
	sizeBytes: number;
	sizeChars: number;
	sourceMapResolved: boolean;
	sourceMapDebug: string | null;
}

export interface AnalysisBundleFetchError {
	url: string;
	sizeBytes: null;
	sizeChars: null;
}

export type ParsePhaseError = { phase: "parse"; message: string };
export type FetchPhaseError = { phase: "fetch"; message: string };

export type AnalysisReport =
	| {
			schemaVersion: 1;
			generatedAt: string;
			status: "ok";
			bundle: AnalysisBundleOk;
			summary: AnalysisSummary;
			warnings: AnalysisWarning[];
			error: null;
	  }
	| {
			schemaVersion: 1;
			generatedAt: string;
			status: "parse_error";
			bundle: AnalysisBundleOk;
			summary: AnalysisSummary;
			warnings: AnalysisWarning[];
			error: ParsePhaseError;
	  }
	| {
			schemaVersion: 1;
			generatedAt: string;
			status: "fetch_error";
			bundle: AnalysisBundleFetchError;
			summary: AnalysisSummary;
			warnings: AnalysisWarning[];
			error: FetchPhaseError;
	  };
