import { resolveInspectedTabId } from "@/utils/inspected-tab";
import { useEffect, useState } from "react";

/**
 * - `checking`: no runtime yet, but the page may still be loading it.
 * - `available`: `window.nubeSDK` is on the page.
 * - `unavailable`: the page has had time to boot and there is still no
 *   runtime. Still re-checked, so a runtime that shows up late (a slow
 *   network, a Local Mode reload) flips the panel open on its own.
 */
export type NubeStatus = "checking" | "available" | "unavailable";

/** How often the page is asked for the runtime while it is missing. */
const POLL_INTERVAL = 1_000;

/**
 * How long a missing runtime is reported as `checking` rather than
 * `unavailable`. The register bundle loads after the page's own scripts, so
 * a panel opened during a page load sees no runtime for a moment, and
 * claiming "not available" for that moment would be wrong in the one
 * direction that sends a developer looking for a problem that is not there.
 */
const GRACE_PERIOD = 5_000;

function checkNubeStatus(tabId: number): Promise<boolean> {
	return new Promise((resolve) => {
		chrome.runtime.sendMessage(
			{
				action: "nube-devtools-check-nube-status",
				payload: { tabId },
			},
			(response?: { status?: boolean }) => {
				// Read so Chrome does not log "Could not establish connection"
				// when the tab is mid-navigation.
				void chrome.runtime.lastError;
				resolve(response?.status === true);
			},
		);
	});
}

/**
 * Whether the inspected page has the NubeSDK runtime.
 *
 * Polls until it does. The panel is reloaded on every new document (see
 * `src/devtools/index.tsx`) and the popup is recreated each time it opens,
 * so an `available` answer never has to be revisited within one mount.
 */
export const useNubeStatus = (): NubeStatus => {
	const [status, setStatus] = useState<NubeStatus>("checking");

	useEffect(() => {
		let disposed = false;
		let timer: ReturnType<typeof setTimeout> | null = null;
		const startedAt = Date.now();

		const schedule = () => {
			timer = setTimeout(check, POLL_INTERVAL);
		};

		const check = async () => {
			const tabId = await resolveInspectedTabId();
			if (disposed) return;

			const available = tabId !== null && (await checkNubeStatus(tabId));
			if (disposed) return;

			if (available) {
				setStatus("available");
				return;
			}

			setStatus(
				Date.now() - startedAt < GRACE_PERIOD ? "checking" : "unavailable",
			);
			schedule();
		};

		check();

		return () => {
			disposed = true;
			if (timer) clearTimeout(timer);
		};
	}, []);

	return status;
};
