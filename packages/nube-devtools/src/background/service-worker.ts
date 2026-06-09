import {
	handleDevToolsEvents,
	handleDevToolsGetComponents,
	handleDevToolsHighlightElement,
	handleDevToolsResendEvent,
	handleDevToolsScrollToElement,
	handleDevToolsVerifyNubeSdkStatus,
} from "./nube-dev-tools";

chrome.scripting
	.registerContentScripts([
		{
			id: "nube-devtools-extension-flag",
			matches: ["http://*/*", "https://*/*"],
			js: ["inject-extension-flag.js"],
			runAt: "document_start",
			world: "MAIN",
		},
	])
	.catch(() => {
		// Already registered (e.g. service worker restart) — safe to ignore.
	});

function updateExtensionBadge(connected: boolean) {
	if (connected) {
		chrome.action.setBadgeText({ text: "1" });
		chrome.action.setBadgeBackgroundColor({ color: "#166534" });
		chrome.action.setBadgeTextColor({ color: "#ffffff" });
	} else {
		chrome.action.setBadgeText({ text: "" });
	}
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === "nube-devtools-app-server-status") {
		updateExtensionBadge(message.payload?.connected === true);
		return false;
	}

	if (message.action === "nube-devtools-check-nube-status") {
		handleDevToolsVerifyNubeSdkStatus({
			sendResponse,
			tabId: message.payload.tabId,
		});
		return true;
	}

	if (message.action === "nube-devtools-monitor-events") {
		if (sender.tab?.id !== undefined) {
			handleDevToolsEvents({
				tabId: sender.tab.id,
			});
		}
		return true;
	}

	if (message.action === "nube-devtools-replay-event") {
		handleDevToolsResendEvent(sendResponse, message.payload);
		return true;
	}

	if (message.action === "nube-devtools-fetch-components") {
		handleDevToolsGetComponents({
			tabId: message.payload.tabId,
			sendResponse,
		});
		return true;
	}

	if (message.action === "nube-devtools-highlight-element") {
		handleDevToolsHighlightElement({
			tabId: message.payload.tabId,
			id: message.payload.id,
			title: message.payload.title,
			type: message.payload.type,
			color: message.payload.color,
			sendResponse,
		});
		return true;
	}

	if (message.action === "nube-devtools-scroll-to-element") {
		handleDevToolsScrollToElement({
			tabId: message.payload.tabId,
			id: message.payload.id,
			sendResponse,
		});
	}
});
