import {
	handleDevToolsEvents,
	handleDevToolsGetApps,
	handleDevToolsGetComponents,
	handleDevToolsHighlightElement,
	handleDevToolsInjectWindowVariable,
	handleDevToolsResendEvent,
	handleDevToolsScrollToElement,
	handleDevToolsVerifyNubeSdkStatus,
} from "./nube-dev-tools";
import {
	checkNubeSDKPresence,
	updateIconBadge,
} from "./scripts/monitor-nube-sdk";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === "nube-devtools-initialize-sdk") {
		if (sender.tab?.id !== undefined) {
			const tabId = sender.tab.id;
			handleDevToolsInjectWindowVariable(tabId);
			setTimeout(async () => {
				const hasNubeSDK = await checkNubeSDKPresence(tabId);
				await updateIconBadge(tabId, hasNubeSDK);
			}, 500);
		}
		return true;
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

	if (message.action === "nube-devtools-fetch-apps") {
		handleDevToolsGetApps({
			tabId: message.payload.tabId,
			sendResponse,
		});
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

	if (message.action === "nube-devtools-sdk-detected") {
		if (sender.tab?.id !== undefined) {
			updateIconBadge(sender.tab.id, true);
		}
		return true;
	}
});

// Monitor nubeSDK presence and update icon badge
const monitorTabs = async () => {
	try {
		const tabs = await chrome.tabs.query({});

		for (const tab of tabs) {
			if (
				tab.id &&
				tab.url &&
				(tab.url.startsWith("http://") || tab.url.startsWith("https://"))
			) {
				const hasNubeSDK = await checkNubeSDKPresence(tab.id);
				await updateIconBadge(tab.id, hasNubeSDK);
			}
		}
	} catch (error) {
		console.debug("Error monitoring tabs:", error);
	}
};

// Check when tabs are updated
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
	// Only check when page is fully loaded
	if (changeInfo.status === "complete") {
		const tab = await chrome.tabs.get(tabId);
		if (
			tab.url &&
			(tab.url.startsWith("http://") || tab.url.startsWith("https://"))
		) {
			// Wait a bit for nubeSDK to initialize
			setTimeout(async () => {
				const hasNubeSDK = await checkNubeSDKPresence(tabId);
				await updateIconBadge(tabId, hasNubeSDK);
			}, 1000);
		}
	}
});

// Check when tabs are activated
chrome.tabs.onActivated.addListener(async (activeInfo) => {
	const tab = await chrome.tabs.get(activeInfo.tabId);
	if (
		tab.url &&
		(tab.url.startsWith("http://") || tab.url.startsWith("https://"))
	) {
		// Small delay to ensure page is ready
		setTimeout(async () => {
			const hasNubeSDK = await checkNubeSDKPresence(activeInfo.tabId);
			await updateIconBadge(activeInfo.tabId, hasNubeSDK);
		}, 300);
	}
});

// Initial check and periodic monitoring
setTimeout(() => {
	monitorTabs();
}, 1000);
// Check every 3 seconds for nubeSDK presence
setInterval(monitorTabs, 3000);
