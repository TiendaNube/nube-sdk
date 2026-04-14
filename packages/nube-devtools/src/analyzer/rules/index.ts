import browserStorageRule from "./browser-storage.js";
import consoleRule from "./console.js";
import domQueryRule from "./dom-query.js";
import evalRule from "./eval.js";
import fetchRule from "./fetch.js";
import functionConstructorRule from "./function-constructor.js";
import globalAccessRule from "./global-access.js";
import importScriptsRule from "./import-scripts.js";
import xhrRule from "./xhr.js";

import type { AnalysisRuleDefinition } from "./types.js";

export type {
	AnalysisRuleDefinition,
	EmitFn,
	RuleContext,
	RuleVisitors,
} from "./types.js";

export const allRules: AnalysisRuleDefinition[] = [
	browserStorageRule,
	consoleRule,
	domQueryRule,
	evalRule,
	fetchRule,
	functionConstructorRule,
	globalAccessRule,
	importScriptsRule,
	xhrRule,
];
