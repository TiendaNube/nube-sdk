/**
 * Static analysis for a JS bundle (Acorn + acorn-walk).
 * Suited to WorkerGlobalScope bundles; hints tell app authors what to strip or verify.
 *
 * `location.generated` is always relative to the analyzed JS string (bundle output).
 * `location.original` is filled when a source map is supplied or resolved (inline / URL / path).
 */

import * as acorn from "acorn";
import * as walk from "acorn-walk";

import type {
	AnalysisBundleFetchError,
	AnalysisBundleOk,
	AnalysisReport,
	AnalysisSummary,
	AnalysisWarning,
	AnalyzeParams,
} from "./types.js";

import {
	compileRules,
	isRuleEnabled,
	severityForRule,
} from "./rule-runtime.js";
import type { RuleRuntime } from "./rule-runtime.js";
import { allRules } from "./rules/index.js";
import type { EmitFn, RuleVisitors } from "./rules/index.js";
import {
	applyOriginalLocations,
	resolveSourceMapForBundle,
} from "./source-map.js";
import type { SourceMapResolutionOptions } from "./source-map.js";
import { locationFromNode, summaryByRule } from "./utils.js";

interface SourceAnalysisOptions {
	bundleUrl: string | null;
	sourceMap?: string | Record<string, unknown>;
	resolveInlineSourceMap?: boolean;
	runtime: RuleRuntime;
}

type ReportPayload =
	| {
			status: "ok";
			bundle: AnalysisBundleOk;
			summary: AnalysisSummary;
			warnings: AnalysisWarning[];
			error: null;
	  }
	| {
			status: "parse_error";
			bundle: AnalysisBundleOk;
			summary: AnalysisSummary;
			warnings: AnalysisWarning[];
			error: { phase: "parse"; message: string };
	  }
	| {
			status: "fetch_error";
			bundle: AnalysisBundleFetchError;
			summary: AnalysisSummary;
			warnings: AnalysisWarning[];
			error: { phase: "fetch"; message: string };
	  };

function buildReport(payload: ReportPayload): AnalysisReport {
	return {
		schemaVersion: 1,
		generatedAt: new Date().toISOString(),
		...payload,
	};
}

async function fetchBundleText(url: string): Promise<string> {
	const res = await fetch(url, { redirect: "manual" });
	if (!res.ok) {
		throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
	}
	return res.text();
}

function createFetchErrorReport(url: string, message: string): AnalysisReport {
	return buildReport({
		status: "fetch_error",
		bundle: { url, sizeBytes: null, sizeChars: null },
		summary: { totalWarnings: 0, byRule: {} },
		warnings: [],
		error: { phase: "fetch", message },
	});
}

function collectVisitors(
	runtime: RuleRuntime,
	emit: EmitFn,
): Record<string, (node: acorn.Node) => void> {
	const ctx = { forbiddenUrlMarkers: runtime.forbiddenUrlMarkers };

	const callHandlers: NonNullable<RuleVisitors["CallExpression"]>[] = [];
	const memberHandlers: NonNullable<RuleVisitors["MemberExpression"]>[] = [];
	const newHandlers: NonNullable<RuleVisitors["NewExpression"]>[] = [];

	for (const rule of allRules) {
		const hasEnabledRule = rule.internalRules.some((r) =>
			isRuleEnabled(runtime, r),
		);
		if (!hasEnabledRule) continue;

		const visitors = rule.visitors(ctx);
		if (visitors.CallExpression) callHandlers.push(visitors.CallExpression);
		if (visitors.MemberExpression)
			memberHandlers.push(visitors.MemberExpression);
		if (visitors.NewExpression) newHandlers.push(visitors.NewExpression);
	}

	const handlers: Record<string, (node: acorn.Node) => void> = {};

	if (callHandlers.length > 0) {
		handlers.CallExpression = (node) => {
			for (const h of callHandlers) h(node as acorn.CallExpression, emit);
		};
	}
	if (memberHandlers.length > 0) {
		handlers.MemberExpression = (node) => {
			for (const h of memberHandlers) h(node as acorn.MemberExpression, emit);
		};
	}
	if (newHandlers.length > 0) {
		handlers.NewExpression = (node) => {
			for (const h of newHandlers) h(node as acorn.NewExpression, emit);
		};
	}

	return handlers;
}

async function analyzeSource(
	source: string,
	options: SourceAnalysisOptions,
): Promise<AnalysisReport> {
	const { bundleUrl, runtime } = options;
	const bundleSizeBytes = new TextEncoder().encode(source).byteLength;
	const bundleSizeChars = source.length;
	const bundle: AnalysisBundleOk = {
		url: bundleUrl,
		sizeBytes: bundleSizeBytes,
		sizeChars: bundleSizeChars,
		sourceMapResolved: false,
		sourceMapDebug: null,
	};

	const parseOpts = {
		ecmaVersion: "latest" as const,
		locations: true as const,
		allowReturnOutsideFunction: true,
		allowHashBang: true,
		allowAwaitOutsideFunction: true,
	};

	let ast: acorn.Program;
	try {
		ast = acorn.parse(source, { ...parseOpts, sourceType: "module" });
	} catch (moduleErr) {
		try {
			ast = acorn.parse(source, { ...parseOpts, sourceType: "script" });
		} catch (scriptErr) {
			const a =
				moduleErr instanceof Error ? moduleErr.message : String(moduleErr);
			const b =
				scriptErr instanceof Error ? scriptErr.message : String(scriptErr);
			return buildReport({
				status: "parse_error",
				bundle,
				summary: { totalWarnings: 0, byRule: {} },
				warnings: [],
				error: {
					phase: "parse",
					message: `module: ${a}; script: ${b}`,
				},
			});
		}
	}

	const smOptions: SourceMapResolutionOptions = {
		sourceMap: options.sourceMap,
		resolveInlineSourceMap: options.resolveInlineSourceMap,
	};
	const rawMap = await resolveSourceMapForBundle(source, bundleUrl, smOptions);
	bundle.sourceMapResolved = Boolean(rawMap);

	const warnings: AnalysisWarning[] = [];
	let warningSeq = 0;

	const emit: EmitFn = (internalRule, message, appHint, node) => {
		if (!isRuleEnabled(runtime, internalRule)) return;
		warningSeq += 1;
		warnings.push({
			id: `w-${warningSeq}`,
			rule: internalRule,
			message,
			severity: severityForRule(runtime, internalRule),
			location: {
				generated: locationFromNode(node),
				original: null,
			},
			hints: appHint ? { app: appHint } : null,
		});
	};

	const visitors = collectVisitors(runtime, emit);
	walk.simple(ast, visitors);

	applyOriginalLocations(warnings, rawMap);

	return buildReport({
		status: "ok",
		bundle,
		summary: {
			totalWarnings: warnings.length,
			byRule: summaryByRule(warnings),
		},
		warnings,
		error: null,
	});
}

/**
 * Fetches the bundle from `url`, then runs checks according to `rules`.
 *
 * @example
 * await analyze({
 *   url: 'https://example.com/app.js',
 *   rules: [{ type: 'fetch', severity: 'error' }],
 * })
 */
export async function analyze(params: AnalyzeParams): Promise<AnalysisReport> {
	const {
		url,
		rules,
		forbiddenUrlMarkers: globalMarkers,
		sourceMap,
		resolveInlineSourceMap,
	} = params;
	const runtime = compileRules(rules, globalMarkers);

	let source: string;
	try {
		source = await fetchBundleText(url);
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		return createFetchErrorReport(url, message);
	}

	return analyzeSource(source, {
		bundleUrl: url,
		sourceMap,
		resolveInlineSourceMap,
		runtime,
	});
}

export type {
	AnalysisBundleFetchError,
	AnalysisBundleOk,
	AnalysisLocation,
	AnalysisReport,
	AnalysisSeverity,
	AnalysisSummary,
	AnalysisWarning,
	AnalyzeParams,
	AnalyzeRule,
	AnalyzeRuleType,
	FetchPhaseError,
	GeneratedPosition,
	OriginalPosition,
	ParsePhaseError,
} from "./types.js";
