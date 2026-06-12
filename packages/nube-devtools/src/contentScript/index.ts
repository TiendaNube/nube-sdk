import type { NubeSDKStorageEvent } from "@/contexts/nube-sdk-storage-context";

interface NubeSDKEventDetail {
	data: unknown[];
}

const PAGE_STORAGE_KEY_DEVTOOLS_APPLICATION =
	"nube-devtools-application-server";

function sendAppServerStatusToBadge() {
	try {
		const stored = sessionStorage.getItem(
			PAGE_STORAGE_KEY_DEVTOOLS_APPLICATION,
		);
		let connected = false;
		if (stored) {
			const data = JSON.parse(stored) as { connected?: boolean };
			connected = data.connected === true;
		}
		chrome.runtime.sendMessage({
			action: "nube-devtools-app-server-status",
			payload: { connected },
		});
	} catch {
		chrome.runtime.sendMessage({
			action: "nube-devtools-app-server-status",
			payload: { connected: false },
		});
	}
}

function onTabFocus() {
	sendAppServerStatusToBadge();
	// chrome.runtime.sendMessage({
	// 	action: "nube-devtools-initialize-sdk",
	// });
}

window.addEventListener("focus", onTabFocus);
if (document.hasFocus()) {
	onTabFocus();
}

if (document.readyState === "loading") {
	window.addEventListener("DOMContentLoaded", () => {
		chrome.runtime.sendMessage({
			action: "nube-devtools-monitor-events",
		});
		return true;
	});
} else {
	// DOM is already loaded, execute immediately
	chrome.runtime.sendMessage({
		action: "nube-devtools-monitor-events",
	});
}

window.addEventListener("NubeSDKEvents", ((event) => {
	const port = chrome.runtime.connect({ name: "nube-devtools-events" });
	const payload = event as CustomEvent<NubeSDKEventDetail>;
	port.postMessage({
		payload: payload.detail,
	});
}) as EventListener);

window.addEventListener("NubeSDKErrorEvents", ((event) => {
	const port = chrome.runtime.connect({ name: "nube-devtools-error-events" });
	const payload = event as CustomEvent;
	port.postMessage({
		payload: payload.detail,
	});
}) as EventListener);

window.addEventListener("NubeSDKStorageEvents", ((event: Event) => {
	const payload = event as CustomEvent<NubeSDKStorageEvent>;
	const port = chrome.runtime.connect({ name: "nube-devtools-storage-events" });
	port.postMessage({
		payload: payload.detail,
	});
}) as EventListener);
