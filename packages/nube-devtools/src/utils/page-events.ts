/**
 * Reads and resets the event history the devtools hook keeps (see
 * `handleEvents`), from the panel.
 */
import { clearEvents, readEvents } from "@/background/scripts";

/**
 * How many dispatches the extension's hook keeps for a panel opened late.
 * Every record carries full `prev` and `next` state snapshots, so the bound
 * matters on a busy page.
 */
export const MAX_EVENT_RECORDS = 1_000;

function inspectedTabId(): number | null {
	const tabId = chrome.devtools?.inspectedWindow?.tabId;
	return typeof tabId === "number" ? tabId : null;
}

export async function readPageEvents(): Promise<NubeSDKDevtoolsRecord[]> {
	const tabId = inspectedTabId();
	if (tabId === null) return [];

	try {
		const results = await chrome.scripting.executeScript({
			target: { tabId },
			world: "MAIN",
			func: readEvents,
		});
		return (results?.[0]?.result as NubeSDKDevtoolsRecord[] | undefined) ?? [];
	} catch {
		// The tab is mid-navigation, or its origin cannot be scripted.
		return [];
	}
}

export async function clearPageEvents(seq: number): Promise<void> {
	const tabId = inspectedTabId();
	if (tabId === null) return;

	try {
		await chrome.scripting.executeScript({
			target: { tabId },
			world: "MAIN",
			func: clearEvents,
			args: [seq],
		});
	} catch {
		// Nothing to clear on a page that cannot be scripted.
	}
}
