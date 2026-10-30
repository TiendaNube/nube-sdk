/**
 * The tab the extension is looking at.
 *
 * Inside the DevTools panel that is `chrome.devtools.inspectedWindow`, and
 * nothing else is correct: with DevTools detached into its own window the
 * inspected tab and the active tab routinely differ. The popup has no
 * `chrome.devtools` at all, so there the active tab is the only answer.
 */
export async function resolveInspectedTabId(): Promise<number | null> {
	const inspected = chrome.devtools?.inspectedWindow?.tabId;
	if (typeof inspected === "number") return inspected;

	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	return tab?.id ?? null;
}

/** Reloads the inspected tab (panel) or the active tab (popup). */
export async function reloadInspectedTab(): Promise<void> {
	const inspected = chrome.devtools?.inspectedWindow;
	if (inspected && typeof inspected.tabId === "number") {
		inspected.reload();
		return;
	}

	const tabId = await resolveInspectedTabId();
	if (tabId !== null) await chrome.tabs.reload(tabId);
}
