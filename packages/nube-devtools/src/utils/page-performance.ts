/**
 * Reads and resets the performance history the page keeps (see
 * `public/inject-performance-monitor.js`), from the panel.
 */
import {
	type NubeSDKPerformanceRecord,
	clearPerformance,
	readPerformance,
} from "@/background/scripts";

export type { NubeSDKPerformanceRecord };

/** Same bound as the page-side buffer. */
export const MAX_PERFORMANCE_RECORDS = 1_000;

function inspectedTabId(): number | null {
	const tabId = chrome.devtools?.inspectedWindow?.tabId;
	return typeof tabId === "number" ? tabId : null;
}

export async function readPagePerformance(): Promise<
	NubeSDKPerformanceRecord[]
> {
	const tabId = inspectedTabId();
	if (tabId === null) return [];

	try {
		const results = await chrome.scripting.executeScript({
			target: { tabId },
			world: "MAIN",
			func: readPerformance,
		});
		return (
			(results?.[0]?.result as NubeSDKPerformanceRecord[] | undefined) ?? []
		);
	} catch {
		// The tab is mid-navigation, or its origin cannot be scripted.
		return [];
	}
}

export async function clearPagePerformance(): Promise<void> {
	const tabId = inspectedTabId();
	if (tabId === null) return;

	try {
		await chrome.scripting.executeScript({
			target: { tabId },
			world: "MAIN",
			func: clearPerformance,
		});
	} catch {
		// Nothing to clear on a page that cannot be scripted.
	}
}
