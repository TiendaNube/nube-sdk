/**
 * Types and panel-side helpers for the performance data collected in the
 * inspected page by `public/inject-performance-monitor.js`.
 *
 * The functions take no imports on purpose: `chrome.scripting.executeScript`
 * serializes the function body and drops its scope.
 */

/**
 * - `network`: a `fetch` made by an app's worker.
 * - `script`: app code timed by the SDK itself (init, slow handlers). Only
 *   the telemetry-enabled SDK builds report it.
 * - `lifecycle`: a milestone of the app's startup.
 */
export type NubeSDKPerformanceKind = "network" | "script" | "lifecycle";

/**
 * One measurement. Mirrors what `inject-performance-monitor.js` reports; keep
 * both in sync.
 */
export type NubeSDKPerformanceRecord = {
	id: string;
	appId: string;
	kind: NubeSDKPerformanceKind;
	/** The SDK telemetry source (`http-fetch`, `event-listener`...) or the milestone. */
	source: string;
	name: string;
	/** For `script`: the SDK metric type (`execution-time`, `long-handler`, `long-task`). */
	metric?: string;
	/** For handler timings: the event the handler ran for. */
	event?: string;
	/** Epoch milliseconds. */
	startedAt: number;
	/** Milliseconds. */
	duration: number;
	method?: string;
	url?: string;
	/** HTTP status. 0 for an opaque response or a failed request. */
	status?: number;
	success?: boolean;
	error?: string;
};

/** Snapshot of the measurements taken on this document, oldest first. */
export const readPerformance = (): NubeSDKPerformanceRecord[] =>
	window.__NUBE_DEVTOOLS_PERFORMANCE__?.slice() ?? [];

/** Empties the page-side history, so a later snapshot does not bring it back. */
export const clearPerformance = (): boolean => {
	window.__NUBE_DEVTOOLS_PERFORMANCE__?.splice(0);
	return true;
};
