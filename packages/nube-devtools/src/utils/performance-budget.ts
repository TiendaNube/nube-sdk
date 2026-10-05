/**
 * Reference budgets for the Performance panel, taken from the W3C Long Tasks
 * API and Google's RAIL model. They are references for reading the numbers,
 * not limits NubeSDK enforces.
 */

export type PerformanceRating = "good" | "needs-improvement" | "poor";

export type PerformanceBudget = {
	/** At or under this is `good`. */
	good: number;
	/** Over this is `poor`; in between is `needs-improvement`. */
	poor: number;
	reference: string;
};

/**
 * Work that holds a thread: a handler or modifier run.
 *
 * Over 50ms is a long task (W3C Long Tasks API), and RAIL asks for input to be
 * handled within 100ms.
 */
export const SYNC_BUDGET: PerformanceBudget = {
	good: 50,
	poor: 100,
	reference: "W3C long task (50ms) · RAIL response (100ms)",
};

/**
 * Work the user waits on: a request, an API call, app startup.
 *
 * RAIL: under 100ms feels instant, and past 1s the user loses focus on the
 * task.
 */
export const ASYNC_BUDGET: PerformanceBudget = {
	good: 100,
	poor: 1_000,
	reference: "RAIL instant (100ms) · RAIL task flow (1s)",
};

export function rate(
	duration: number,
	budget: PerformanceBudget,
): PerformanceRating {
	if (duration <= budget.good) return "good";
	if (duration <= budget.poor) return "needs-improvement";
	return "poor";
}

/** Nearest-rank percentile. `p` from 0 to 100. */
export function percentile(values: number[], p: number): number | null {
	if (values.length === 0) return null;
	const sorted = [...values].sort((a, b) => a - b);
	const rank = Math.ceil((p / 100) * sorted.length);
	return sorted[Math.min(sorted.length, Math.max(1, rank)) - 1];
}

export function formatMs(duration: number | null): string {
	if (duration === null) return "–";
	if (duration < 1) return "<1ms";
	if (duration < 1_000) return `${Math.round(duration)}ms`;
	return `${(duration / 1_000).toFixed(2)}s`;
}
