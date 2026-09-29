/**
 * Reads and resets the command bridge history the page keeps (see
 * `handleCommands`), from the panel.
 */
import {
	type NubeSDKCommandRecord,
	clearCommands,
	readCommands,
} from "@/background/scripts";

export type { NubeSDKCommandRecord };

/**
 * How many calls the page keeps for a panel opened late. A page boot makes a
 * handful; the bound is for a long session polling something like
 * `AvailableSlots`.
 */
export const MAX_COMMAND_RECORDS = 500;

function inspectedTabId(): number | null {
	const tabId = chrome.devtools?.inspectedWindow?.tabId;
	return typeof tabId === "number" ? tabId : null;
}

export async function readPageCommands(): Promise<NubeSDKCommandRecord[]> {
	const tabId = inspectedTabId();
	if (tabId === null) return [];

	try {
		const results = await chrome.scripting.executeScript({
			target: { tabId },
			world: "MAIN",
			func: readCommands,
		});
		return (results?.[0]?.result as NubeSDKCommandRecord[] | undefined) ?? [];
	} catch {
		// The tab is mid-navigation, or its origin cannot be scripted.
		return [];
	}
}

export async function clearPageCommands(): Promise<void> {
	const tabId = inspectedTabId();
	if (tabId === null) return;

	try {
		await chrome.scripting.executeScript({
			target: { tabId },
			world: "MAIN",
			func: clearCommands,
		});
	} catch {
		// Nothing to clear on a page that cannot be scripted.
	}
}
