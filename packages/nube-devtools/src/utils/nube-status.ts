/** What the page reports when asked for the NubeSDK. */
export type NubeStatusCheck = { status: boolean; loaded: boolean };

export const NUBE_STATUS_RETRY_DELAY_MS = 500;
/** Gives up after 10 s, for pages that never finish loading. */
const MAX_ATTEMPTS = 20;
/** The adapter loads async: the SDK can start up to 2 s after the page loads. */
const MAX_ATTEMPTS_AFTER_LOAD = 4;

export type NubeStatusAttempts = { total: number; afterLoad: number };

/** What to do after a check: `attempts` counts the checks made so far, this one included. */
export function nextNubeStatusStep(
	check: NubeStatusCheck,
	attempts: NubeStatusAttempts,
): "detected" | "missing" | "retry" {
	if (check.status) {
		return "detected";
	}
	if (
		attempts.total >= MAX_ATTEMPTS ||
		attempts.afterLoad >= MAX_ATTEMPTS_AFTER_LOAD
	) {
		return "missing";
	}
	return "retry";
}
