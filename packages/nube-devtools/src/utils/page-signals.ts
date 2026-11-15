/**
 * Reads and resets the signal history the devtools hook keeps (see
 * `handleEvents`), from the panel.
 */
import {
	type NubeSDKSignalsSnapshot,
	clearSignals,
	readSignals,
} from "@/background/scripts";

/** How many signal records the extension's hook, and the panel, keep. */
export const MAX_SIGNAL_RECORDS = 500;

const EMPTY: NubeSDKSignalsSnapshot = {
	supported: false,
	records: [],
	graphs: [],
};

function inspectedTabId(): number | null {
	const tabId = chrome.devtools?.inspectedWindow?.tabId;
	return typeof tabId === "number" ? tabId : null;
}

export async function readPageSignals(): Promise<NubeSDKSignalsSnapshot> {
	const tabId = inspectedTabId();
	if (tabId === null) return EMPTY;

	try {
		const results = await chrome.scripting.executeScript({
			target: { tabId },
			world: "MAIN",
			func: readSignals,
		});
		return (
			(results?.[0]?.result as NubeSDKSignalsSnapshot | undefined) ?? EMPTY
		);
	} catch {
		// The tab is mid-navigation, or its origin cannot be scripted.
		return EMPTY;
	}
}

export async function clearPageSignals(seq: number): Promise<void> {
	const tabId = inspectedTabId();
	if (tabId === null) return;

	try {
		await chrome.scripting.executeScript({
			target: { tabId },
			world: "MAIN",
			func: clearSignals,
			args: [seq],
		});
	} catch {
		// Nothing to clear on a page that cannot be scripted.
	}
}
