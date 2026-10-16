import { syncDevToolsHeaderRule } from "./devtools-header";
import {
	handleDevToolsEvents,
	handleDevToolsResendEvent,
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

// Registered on its own so an existing registration of the flag script (the
// call above rejects as a whole when any id already exists) cannot keep it
// from being added.
chrome.scripting
	.registerContentScripts([
		{
			id: "nube-devtools-performance-monitor",
			matches: ["http://*/*", "https://*/*"],
			js: ["inject-performance-monitor.js"],
			runAt: "document_start",
			world: "MAIN",
		},
	])
	.catch(() => {
		// Already registered (e.g. service worker restart) — safe to ignore.
	});

chrome.runtime.onInstalled.addListener(syncDevToolsHeaderRule);
chrome.runtime.onStartup.addListener(syncDevToolsHeaderRule);
syncDevToolsHeaderRule();

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
});
