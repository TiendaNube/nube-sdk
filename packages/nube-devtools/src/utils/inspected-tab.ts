/**
 * Whether a port was opened by the content script of the tab this panel
 * inspects.
 *
 * `chrome.runtime.onConnect` fires in every open panel for every tab's
 * content script, so a panel that does not check the sender shows other
 * tabs' events as its own. Outside DevTools there is no inspected tab and
 * every port is accepted.
 */
export function isFromInspectedTab(port: chrome.runtime.Port): boolean {
	const inspected = chrome.devtools?.inspectedWindow?.tabId;
	if (typeof inspected !== "number") return true;
	return port.sender?.tab?.id === inspected;
}
