import { TraceMap, originalPositionFor } from "@jridgewell/trace-mapping";

import type { AnalysisWarning } from "./types.js";

export interface RawSourceMap {
	version: number;
	sources: string[];
	names: string[];
	mappings: string;
	file?: string;
	sourceRoot?: string;
	sourcesContent?: (string | null)[];
}

export interface SourceMapResolutionOptions {
	sourceMap?: string | Record<string, unknown>;
	resolveInlineSourceMap?: boolean;
}

function getLastSourceMappingURLRef(source: string): string | null {
	let last: string | null = null;
	for (const m of source.matchAll(/\/\/[#@] sourceMappingURL=([^\r\n]+)/g)) {
		last = m[1].trim();
	}
	for (const m of source.matchAll(
		/\/\*[#@]\s*sourceMappingURL=([^\s]+)\s*\*\//g,
	)) {
		last = m[1].trim();
	}
	return last;
}

function tryParseSourceMapDataUrl(ref: string): RawSourceMap | null {
	const m = ref.match(
		/^data:application\/json[^;]*;(?:charset=[^;]+;)?base64,(.+)$/i,
	);
	if (!m) return null;
	try {
		const json = Buffer.from(m[1].trim(), "base64").toString("utf8");
		const parsed: unknown = JSON.parse(json);
		if (typeof parsed === "object" && parsed !== null && "version" in parsed) {
			return parsed as RawSourceMap;
		}
		return null;
	} catch {
		return null;
	}
}

function normalizeSourceMapInput(input: unknown): RawSourceMap | null {
	if (input == null) return null;
	if (typeof input === "object" && input !== null && "version" in input) {
		const v = (input as { version: unknown }).version;
		if (typeof v === "number") return input as RawSourceMap;
	}
	if (typeof input === "string") {
		try {
			const parsed: unknown = JSON.parse(input);
			return normalizeSourceMapInput(parsed);
		} catch {
			return null;
		}
	}
	return null;
}

async function fetchSourceMapJson(url: string): Promise<RawSourceMap | null> {
	try {
		const res = await fetch(url, { redirect: "manual" });
		if (!res.ok) return null;
		const data: unknown = await res.json();
		return normalizeSourceMapInput(data);
	} catch {
		return null;
	}
}

export async function resolveSourceMapForBundle(
	source: string,
	bundleUrl: string | null,
	options: SourceMapResolutionOptions,
): Promise<RawSourceMap | null> {
	const explicit = normalizeSourceMapInput(options.sourceMap);
	if (explicit) return explicit;

	if (options.resolveInlineSourceMap === false) return null;

	const ref = getLastSourceMappingURLRef(source);
	if (!ref) return null;

	const fromData = tryParseSourceMapDataUrl(ref);
	if (fromData) return fromData;

	try {
		if (/^https?:\/\//i.test(ref)) {
			return await fetchSourceMapJson(ref);
		}
		if (bundleUrl) {
			const resolved = new URL(ref, bundleUrl).href;
			return await fetchSourceMapJson(resolved);
		}
	} catch {
		return null;
	}
	return null;
}

export function applyOriginalLocations(
	warnings: AnalysisWarning[],
	rawMap: RawSourceMap | null,
): void {
	if (!rawMap) return;
	try {
		const tracer = new TraceMap(
			rawMap as unknown as ConstructorParameters<typeof TraceMap>[0],
		);
		for (const w of warnings) {
			const g = w.location.generated;
			if (!g) continue;
			const o = originalPositionFor(tracer, {
				line: g.line,
				column: g.column,
			});
			if (o.source != null && o.line != null && o.column != null) {
				w.location.original = {
					source: o.source,
					line: o.line,
					column: o.column,
				};
			}
		}
	} catch {
		// Malformed source map — skip original location mapping
	}
}
