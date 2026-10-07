import { EXECUTE_IN_PAGE_ACTION, TAB_RELAY_PORT } from "@/lib/page-bridge";
import { syncDevToolsHeaderRule } from "./devtools-header";
import {
	handleDevToolsEvents,
	handleDevToolsGetComponents,
	handleDevToolsHighlightElement,
	handleDevToolsResendEvent,
	handleDevToolsScrollToElement,
	handleDevToolsVerifyNubeSdkStatus,
} from "./nube-dev-tools";
import { PAGE_SCRIPTS, type PageScriptName } from "./scripts/registry";

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
	// Firefox devtools pages have no `scripting`: see `executeInPage`.
	if (message.action === EXECUTE_IN_PAGE_ACTION) {
		const { tabId, name, args } = message.payload as {
			tabId: number;
			name: PageScriptName;
			args: unknown[];
		};
		const func = PAGE_SCRIPTS[name];
		if (!func) {
			sendResponse({ ok: false, error: `unknown page script: ${name}` });
			return false;
		}
		chrome.scripting
			.executeScript({
				target: { tabId },
				world: "MAIN",
				func: func as (...args: unknown[]) => unknown,
				args,
			})
			.then((results) => sendResponse({ ok: true, results }))
			.catch((error) => sendResponse({ ok: false, error: String(error) }));
		return true;
	}

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

// Firefox devtools pages have no `tabs`: the panel's port to the content
// script comes here and is relayed. See `connectToTab`.
chrome.runtime.onConnect.addListener((panelPort) => {
	if (!panelPort.name.startsWith(`${TAB_RELAY_PORT}:`)) return;

	const [, tabIdPart, ...nameParts] = panelPort.name.split(":");
	const tabId = Number(tabIdPart);
	const tabPort = chrome.tabs.connect(tabId, { name: nameParts.join(":") });

	tabPort.onMessage.addListener((message) => panelPort.postMessage(message));
	panelPort.onMessage.addListener((message) => tabPort.postMessage(message));
	tabPort.onDisconnect.addListener(() => {
		void chrome.runtime.lastError;
		panelPort.disconnect();
	});
	panelPort.onDisconnect.addListener(() => tabPort.disconnect());
});
