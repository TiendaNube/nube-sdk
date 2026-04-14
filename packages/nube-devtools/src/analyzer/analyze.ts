/**
 * Static analysis for a JS bundle (Acorn + acorn-walk).
 * Suited to WorkerGlobalScope bundles; hints tell app authors what to strip or verify.
 *
 * `location.generated` is always relative to the analyzed JS string (bundle output).
 * `location.original` is filled when a source map is supplied or resolved (inline / URL / path).
 */

import * as acorn from 'acorn'
import * as walk from 'acorn-walk'
import { TraceMap, originalPositionFor } from '@jridgewell/trace-mapping'

import type {
  AnalysisBundleFetchError,
  AnalysisBundleOk,
  AnalysisReport,
  AnalysisSeverity,
  AnalysisSummary,
  AnalysisWarning,
  AnalyzeParams,
  AnalyzeRule,
  AnalyzeRuleType,
} from './types.js'

const DEFAULT_FORBIDDEN_URL_MARKERS: readonly string[] = [
  'api.github.com',
  'evil.com',
  'malware',
  '127.0.0.1:666',
  'metadata.google.internal',
]

const DOM_QUERY_METHODS = new Set([
  'querySelector',
  'querySelectorAll',
  'getElementById',
  'getElementsByClassName',
  'getElementsByTagName',
  'getElementsByName',
])

const WORKER_RISKY_GLOBALS = new Set(['window', 'document', 'parent', 'frames', 'frameElement'])

const BROWSER_STORAGE_GLOBALS = new Set(['localStorage', 'sessionStorage'])

/** Default severity per emitted rule id when not overridden by `rules`. */
const DEFAULT_SEVERITY_BY_RULE: Record<string, AnalysisSeverity> = {
  'dom-query': 'error',
  'global-access': 'error',
  eval: 'error',
  'function-constructor': 'error',
  'forbidden-fetch-url': 'error',
  'dynamic-fetch-url': 'warning',
  'import-scripts': 'warning',
  xhr: 'info',
  console: 'info',
  'browser-storage': 'warning',
}

const INTERNAL_RULE_TO_USER_TYPE: Record<string, AnalyzeRuleType> = {
  'forbidden-fetch-url': 'fetch',
  'dynamic-fetch-url': 'fetch',
  'import-scripts': 'import-scripts',
  'dom-query': 'dom-query',
  'global-access': 'global-access',
  eval: 'eval',
  'function-constructor': 'function-constructor',
  xhr: 'xhr',
  console: 'console',
  'browser-storage': 'browser-storage',
}

type RuleRuntime =
  | { mode: 'all'; severityByType: Map<AnalyzeRuleType, AnalysisSeverity>; forbiddenUrlMarkers: string[] }
  | {
      mode: 'subset'
      enabledTypes: Set<AnalyzeRuleType>
      severityByType: Map<AnalyzeRuleType, AnalysisSeverity>
      forbiddenUrlMarkers: string[]
    }

function compileRules(rules: AnalyzeRule[], globalFetchMarkers?: string[]): RuleRuntime {
  const severityByType = new Map<AnalyzeRuleType, AnalysisSeverity>()
  const defaultMarkers =
    globalFetchMarkers !== undefined && globalFetchMarkers.length > 0
      ? [...globalFetchMarkers]
      : [...DEFAULT_FORBIDDEN_URL_MARKERS]

  if (rules.length === 0) {
    return {
      mode: 'all',
      severityByType,
      forbiddenUrlMarkers: defaultMarkers,
    }
  }

  const enabledTypes = new Set<AnalyzeRuleType>()
  const fetchMarkers: string[] = []
  let fetchMarkersExplicit = false

  for (const r of rules) {
    enabledTypes.add(r.type)
    if (r.severity !== undefined) {
      severityByType.set(r.type, r.severity)
    }
    if (r.type === 'fetch' && r.forbiddenUrlMarkers !== undefined && r.forbiddenUrlMarkers.length > 0) {
      fetchMarkers.push(...r.forbiddenUrlMarkers)
      fetchMarkersExplicit = true
    }
  }

  const forbiddenUrlMarkers =
    fetchMarkersExplicit && fetchMarkers.length > 0
      ? [...new Set(fetchMarkers)]
      : defaultMarkers

  return { mode: 'subset', enabledTypes, severityByType, forbiddenUrlMarkers }
}

function userTypeForInternalRule(internalRule: string): AnalyzeRuleType {
  return INTERNAL_RULE_TO_USER_TYPE[internalRule] ?? (internalRule as AnalyzeRuleType)
}

function isRuleEnabled(runtime: RuleRuntime, internalRule: string): boolean {
  if (runtime.mode === 'all') return true
  return runtime.enabledTypes.has(userTypeForInternalRule(internalRule))
}

function severityForRule(runtime: RuleRuntime, internalRule: string): AnalysisSeverity {
  const userType = userTypeForInternalRule(internalRule)
  return (
    runtime.severityByType.get(userType) ?? DEFAULT_SEVERITY_BY_RULE[internalRule] ?? 'warning'
  )
}

interface RawSourceMap {
  version: number
  sources: string[]
  names: string[]
  mappings: string
  file?: string
  sourceRoot?: string
  sourcesContent?: (string | null)[]
}

interface SourceAnalysisOptions {
  bundleUrl: string | null
  sourceMap?: string | Record<string, unknown>
  resolveInlineSourceMap?: boolean
  runtime: RuleRuntime
}

type ReportPayload =
  | {
      status: 'ok'
      bundle: AnalysisBundleOk
      summary: AnalysisSummary
      warnings: AnalysisWarning[]
      error: null
    }
  | {
      status: 'parse_error'
      bundle: AnalysisBundleOk
      summary: AnalysisSummary
      warnings: AnalysisWarning[]
      error: { phase: 'parse'; message: string }
    }
  | {
      status: 'fetch_error'
      bundle: AnalysisBundleFetchError
      summary: AnalysisSummary
      warnings: AnalysisWarning[]
      error: { phase: 'fetch'; message: string }
    }

function buildReport(payload: ReportPayload): AnalysisReport {
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    ...payload,
  }
}

function locationFromNode(node: acorn.Node): AnalysisWarning['location']['generated'] {
  const start = node.loc?.start
  if (start) {
    return { line: start.line, column: start.column }
  }
  return null
}

function summaryByRule(warnings: AnalysisWarning[]): Record<string, number> {
  const byRule: Record<string, number> = {}
  for (const w of warnings) {
    byRule[w.rule] = (byRule[w.rule] ?? 0) + 1
  }
  return byRule
}

function stringifyUrlArg(node: acorn.Node | undefined): {
  kind: 'none' | 'literal' | 'template' | 'dynamic'
  value: string | null
} {
  if (!node) return { kind: 'none', value: null }
  if (node.type === 'Literal') {
    const lit = node as acorn.Literal
    if (typeof lit.value === 'string') {
      return { kind: 'literal', value: lit.value }
    }
  }
  if (node.type === 'TemplateLiteral') {
    const tpl = node as acorn.TemplateLiteral
    if (tpl.expressions.length === 0 && tpl.quasis[0]) {
      return {
        kind: 'template',
        value: tpl.quasis[0].value.cooked ?? tpl.quasis[0].value.raw,
      }
    }
  }
  return { kind: 'dynamic', value: null }
}

function calleeName(callee: acorn.Node): string | null {
  if (callee.type === 'Identifier') {
    return (callee as acorn.Identifier).name
  }
  if (callee.type === 'MemberExpression') {
    const mem = callee as acorn.MemberExpression
    if (!mem.computed && mem.property.type === 'Identifier') {
      return (mem.property as acorn.Identifier).name
    }
  }
  return null
}

function getLastSourceMappingURLRef(source: string): string | null {
  let last: string | null = null
  for (const m of source.matchAll(/\/\/[#@] sourceMappingURL=([^\r\n]+)/g)) {
    last = m[1].trim()
  }
  for (const m of source.matchAll(/\/\*[#@]\s*sourceMappingURL=([^\s]+)\s*\*\//g)) {
    last = m[1].trim()
  }
  return last
}

function tryParseSourceMapDataUrl(ref: string): RawSourceMap | null {
  const m = ref.match(/^data:application\/json[^;]*;(?:charset=[^;]+;)?base64,(.+)$/i)
  if (!m) return null
  try {
    const json = Buffer.from(m[1].trim(), 'base64').toString('utf8')
    const parsed: unknown = JSON.parse(json)
    if (typeof parsed === 'object' && parsed !== null && 'version' in parsed) {
      return parsed as RawSourceMap
    }
    return null
  } catch {
    return null
  }
}

function normalizeSourceMapInput(input: unknown): RawSourceMap | null {
  if (input == null) return null
  if (typeof input === 'object' && input !== null && 'version' in input) {
    const v = (input as { version: unknown }).version
    if (typeof v === 'number') return input as RawSourceMap
  }
  if (typeof input === 'string') {
    try {
      const parsed: unknown = JSON.parse(input)
      return normalizeSourceMapInput(parsed)
    } catch {
      return null
    }
  }
  return null
}

async function fetchSourceMapJson(url: string): Promise<RawSourceMap | null> {
  try {
    const res = await fetch(url, { redirect: 'manual' })
    if (!res.ok) return null
    const data: unknown = await res.json()
    return normalizeSourceMapInput(data)
  } catch {
    return null
  }
}

async function resolveSourceMapForBundle(
  source: string,
  bundleUrl: string | null,
  options: Pick<SourceAnalysisOptions, 'sourceMap' | 'resolveInlineSourceMap'>,
): Promise<RawSourceMap | null> {
  const explicit = normalizeSourceMapInput(options.sourceMap)
  if (explicit) return explicit

  if (options.resolveInlineSourceMap === false) return null

  const ref = getLastSourceMappingURLRef(source)
  if (!ref) return null

  const fromData = tryParseSourceMapDataUrl(ref)
  if (fromData) return fromData

  try {
    if (/^https?:\/\//i.test(ref)) {
      return await fetchSourceMapJson(ref)
    }
    if (bundleUrl) {
      const resolved = new URL(ref, bundleUrl).href
      return await fetchSourceMapJson(resolved)
    }
  } catch {
    return null
  }
  return null
}

function applyOriginalLocations(
  warnings: AnalysisWarning[],
  rawMap: RawSourceMap | null,
): void {
  if (!rawMap) return
  try {
    const tracer = new TraceMap(rawMap as unknown as ConstructorParameters<typeof TraceMap>[0])
    for (const w of warnings) {
      const g = w.location.generated
      if (!g) continue
      const o = originalPositionFor(tracer, {
        line: g.line,
        column: g.column,
      })
      if (o.source != null && o.line != null && o.column != null) {
        w.location.original = {
          source: o.source,
          line: o.line,
          column: o.column,
        }
      }
    }
  } catch {
    // Malformed source map — skip original location mapping
  }
}

function truncate(s: string, max = 120): string {
  if (s.length <= max) return s
  return `${s.slice(0, max)}…`
}

async function fetchBundleText(url: string): Promise<string> {
  const res = await fetch(url, { redirect: 'manual' })
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`)
  }
  return res.text()
}

function createFetchErrorReport(url: string, message: string): AnalysisReport {
  return buildReport({
    status: 'fetch_error',
    bundle: { url, sizeBytes: null, sizeChars: null },
    summary: { totalWarnings: 0, byRule: {} },
    warnings: [],
    error: { phase: 'fetch', message },
  })
}

async function analyzeSource(source: string, options: SourceAnalysisOptions): Promise<AnalysisReport> {
  const { bundleUrl, runtime } = options
  const bundleSizeBytes = new TextEncoder().encode(source).byteLength
  const bundleSizeChars = source.length
  const bundle: AnalysisBundleOk = {
    url: bundleUrl,
    sizeBytes: bundleSizeBytes,
    sizeChars: bundleSizeChars,
    sourceMapResolved: false,
    sourceMapDebug: null,
  }
  const forbiddenUrlMarkers = runtime.forbiddenUrlMarkers

  const parseOpts = {
    ecmaVersion: 'latest' as const,
    locations: true as const,
    allowReturnOutsideFunction: true,
    allowHashBang: true,
    allowAwaitOutsideFunction: true,
  }

  let ast: acorn.Program
  try {
    ast = acorn.parse(source, { ...parseOpts, sourceType: 'module' })
  } catch (moduleErr) {
    try {
      ast = acorn.parse(source, { ...parseOpts, sourceType: 'script' })
    } catch (scriptErr) {
      const a = moduleErr instanceof Error ? moduleErr.message : String(moduleErr)
      const b = scriptErr instanceof Error ? scriptErr.message : String(scriptErr)
      return buildReport({
        status: 'parse_error',
        bundle,
        summary: { totalWarnings: 0, byRule: {} },
        warnings: [],
        error: {
          phase: 'parse',
          message: `module: ${a}; script: ${b}`,
        },
      })
    }
  }

  const rawMap = await resolveSourceMapForBundle(source, bundleUrl, options)
  bundle.sourceMapResolved = Boolean(rawMap)

  const warnings: AnalysisWarning[] = []
  let warningSeq = 0

  const push = (
    internalRule: string,
    message: string,
    appHint: string | null,
    node: acorn.Node,
  ): void => {
    if (!isRuleEnabled(runtime, internalRule)) return
    warningSeq += 1
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
    })
  }

  walk.simple(ast, {
    CallExpression(node) {
      const callee = node.callee
      if (
        callee.type === 'MemberExpression' &&
        callee.object.type === 'Identifier' &&
        callee.object.name === 'console'
      ) {
        const prop =
          !callee.computed && callee.property.type === 'Identifier'
            ? callee.property.name
            : callee.computed
              ? '[computed]'
              : '?'
        push(
          'console',
          `console.${prop}()`,
          'Strip or guard console usage in the app bundle for production.',
          node,
        )
      }

      const name = calleeName(callee)

      if (name === 'fetch' || name === 'importScripts') {
        const arg0 = node.arguments[0]
        const urlInfo = stringifyUrlArg(
          arg0 && arg0.type !== 'SpreadElement' ? arg0 : undefined,
        )
        if (name === 'fetch') {
          if (urlInfo.kind === 'literal' || urlInfo.kind === 'template') {
            const u = urlInfo.value ?? ''
            for (const marker of forbiddenUrlMarkers) {
              if (marker && u.includes(marker)) {
                push(
                  'forbidden-fetch-url',
                  `fetch() URL matches marker "${marker}": ${truncate(u)}`,
                  'Review allowlists; malicious or unintended app code can still exfiltrate via fetch.',
                  node,
                )
              }
            }
          } else if (urlInfo.kind === 'dynamic') {
            push(
              'dynamic-fetch-url',
              'fetch() URL is not a static string — cannot verify destination.',
              'Have the app verify dynamic destinations at runtime or enforce a URL policy.',
              node,
            )
          }
        }
        if (name === 'importScripts') {
          const u = stringifyUrlArg(
            arg0 && arg0.type !== 'SpreadElement' ? arg0 : undefined,
          )
          const desc =
            u.kind === 'literal' || u.kind === 'template'
              ? `importScripts("${truncate(u.value ?? '')}")`
              : 'importScripts() with non-literal URL'
          push(
            'import-scripts',
            desc,
            'Ensure the app only loads trusted scripts via importScripts.',
            node,
          )
        }
      }

      if (name && DOM_QUERY_METHODS.has(name)) {
        push(
          'dom-query',
          `Call to ${name}()`,
          'No DOM in this context; remove misplaced code from the app or it may throw at runtime.',
          node,
        )
      }

      if (name === 'eval') {
        push('eval', 'eval() call', 'Remove or replace eval in the app; security and CSP risk.', node)
      }

      if (name === 'Function' && callee.type === 'Identifier') {
        push('function-constructor', 'Function constructor (similar risk profile to eval).', null, node)
      }
    },

    MemberExpression(node) {
      if (node.object.type === 'Identifier') {
        const obj = node.object.name
        if (WORKER_RISKY_GLOBALS.has(obj)) {
          const prop =
            !node.computed && node.property.type === 'Identifier'
              ? node.property.name
              : node.computed
                ? '[computed]'
                : '?'
          push(
            'global-access',
            `Access ${obj}.${prop}`,
            obj === 'window' || obj === 'document'
              ? 'Not on dedicated WorkerGlobalScope; use self/globalThis or remove from the app bundle.'
              : 'Behavior may differ; remove from the app if this access is unintended.',
            node,
          )
        }
        if (BROWSER_STORAGE_GLOBALS.has(obj)) {
          const prop =
            !node.computed && node.property.type === 'Identifier'
              ? node.property.name
              : node.computed
                ? '[computed]'
                : '?'
          push(
            'browser-storage',
            `Access ${obj}.${prop}`,
            `Direct ${obj} access is not available; use nube.getBrowserAPIs() from NubeSDK instead.`,
            node,
          )
        }
      }
    },

    NewExpression(node) {
      const callee = node.callee
      if (callee.type === 'Identifier' && callee.name === 'XMLHttpRequest') {
        push(
          'xhr',
          'new XMLHttpRequest()',
          'Review request URLs in the app the same way as fetch.',
          node,
        )
      }
    },
  })

  applyOriginalLocations(warnings, rawMap)

  return buildReport({
    status: 'ok',
    bundle,
    summary: {
      totalWarnings: warnings.length,
      byRule: summaryByRule(warnings),
    },
    warnings,
    error: null,
  })
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
  const { url, rules, forbiddenUrlMarkers: globalMarkers, sourceMap, resolveInlineSourceMap } = params
  const runtime = compileRules(rules, globalMarkers)

  let source: string
  try {
    source = await fetchBundleText(url)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return createFetchErrorReport(url, message)
  }

  return analyzeSource(source, {
    bundleUrl: url,
    sourceMap,
    resolveInlineSourceMap,
    runtime,
  })
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
} from './types.js'
