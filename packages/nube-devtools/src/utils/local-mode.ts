import { getPageSessionStorage, setPageSessionStorage } from "./page-storage";

/** Where local mode keeps the app it serves, in the page's sessionStorage. */
export const PAGE_STORAGE_KEY_DEVTOOLS_APPLICATION =
	"nube-devtools-application-server";

/** Marks the stored local mode app as disconnected, if it is connected. */
export async function markStoredAsDisconnected(): Promise<void> {
	const stored = await getPageSessionStorage(
		PAGE_STORAGE_KEY_DEVTOOLS_APPLICATION,
	);
	if (!stored) return;

	const data = JSON.parse(stored) as { connected?: boolean };
	if (!data.connected) return;

	data.connected = false;
	await setPageSessionStorage(
		PAGE_STORAGE_KEY_DEVTOOLS_APPLICATION,
		JSON.stringify(data),
	);
}

/**
 * Stops the local mode app from outside the Local Mode page: what its "Stop
 * App" button does, minus the page's own state.
 */
export async function stopLocalModeApp(): Promise<void> {
	await markStoredAsDisconnected();
	chrome.runtime.sendMessage({
		action: "nube-devtools-app-server-status",
		payload: { connected: false },
	});
	// The inspected tab, not the active one: they differ with detached devtools.
	const inspected = chrome.devtools?.inspectedWindow?.tabId;
	if (typeof inspected === "number") {
		chrome.tabs.reload(inspected);
		return;
	}
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	if (tab?.id) chrome.tabs.reload(tab.id);
}
