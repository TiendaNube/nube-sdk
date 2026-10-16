/**
 * Reads and resets the log history the devtools hook keeps (see
 * `handleEvents`), from the panel.
 */
import { clearLogs, readLogs } from "@/background/scripts";

/** How many logs the extension's hook, and the panel, keep. */
export const MAX_LOG_RECORDS = 1_000;

function inspectedTabId(): number | null {
	const tabId = chrome.devtools?.inspectedWindow?.tabId;
	return typeof tabId === "number" ? tabId : null;
}

export async function readPageLogs(): Promise<NubeSDKDevtoolsLogRecord[]> {
	const tabId = inspectedTabId();
	if (tabId === null) return [];

	try {
		const results = await chrome.scripting.executeScript({
			target: { tabId },
			world: "MAIN",
			func: readLogs,
		});
		return (
			(results?.[0]?.result as NubeSDKDevtoolsLogRecord[] | undefined) ?? []
		);
	} catch {
		// The tab is mid-navigation, or its origin cannot be scripted.
		return [];
	}
}

export async function clearPageLogs(seq: number): Promise<void> {
	const tabId = inspectedTabId();
	if (tabId === null) return;

	try {
		await chrome.scripting.executeScript({
			target: { tabId },
			world: "MAIN",
			func: clearLogs,
			args: [seq],
		});
	} catch {
		// Nothing to clear on a page that cannot be scripted.
	}
}
