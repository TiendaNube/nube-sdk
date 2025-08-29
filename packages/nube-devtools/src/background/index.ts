import type { DevModeConfig } from "../devtools/pages/dev-mode";
import { DevModeMonitor } from "./dev-mode-monitor";
import {
	handleDevToolsCheckScript,
	handleDevToolsEvents,
	handleDevToolsGetApps,
	handleDevToolsGetComponents,
	handleDevToolsHighlightElement,
	handleDevToolsInjectWindowVariable,
	handleDevToolsRegisterApp,
	handleDevToolsResendEvent,
	handleDevToolsScrollToElement,
	handleDevToolsVerifyNubeSdkStatus,
} from "./nube-dev-tools";
import { setupRequestInterceptor } from "./request-interceptor";

// Configure the request interceptor when the service worker starts
setupRequestInterceptor().catch((error) => {
	console.error("Error configuring request interceptor:", error);
});

// Start the dev mode monitor
const devModeMonitor = DevModeMonitor.getInstance();
devModeMonitor.start();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === "nube-devtools-initialize-sdk") {
		if (sender.tab?.id !== undefined) {
			handleDevToolsInjectWindowVariable(sender.tab.id);
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
		return true;
	}

	if (message.action === "nube-devtools-check-script") {
		handleDevToolsCheckScript({
			tabId: message.payload.tabId,
			scriptUrl: message.payload.scriptUrl,
			sendResponse,
		});
		return true;
	}

	if (message.action === "nube-devtools-register-app") {
		handleDevToolsRegisterApp({
			tabId: message.payload.tabId,
			scriptUrl: message.payload.scriptUrl,
			sendResponse,
		});
		return true;
	}

	if (message.action === "nube-devtools-dev-mode-config-changed") {
		const config: DevModeConfig = message.payload;
		devModeMonitor.applyConfig(config);
		return true;
	}
});
