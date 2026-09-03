import type { NubeSDKStorageEvent } from "@/contexts/nube-sdk-storage-context";

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

/**
 * Single long-lived port for the event stream, owned by
 * `NubeSDKEventsProvider` on the panel side (the only consumer, and mounted
 * for as long as the panel is open).
 *
 * A port per event — what this used to do — meant a burst of connections on
 * every page load, since the runtime hook replays its whole buffer when the
 * injected script subscribes. A port per batch would instead leak one port
 * per batch, as nothing disconnects them.
 *
 * The port dies when the panel closes; it is reopened lazily on the next
 * batch, and events dispatched while no panel is listening are dropped —
 * which is what happened before as well.
 */
let eventsPort: chrome.runtime.Port | null = null;

function getEventsPort(): chrome.runtime.Port | null {
	if (eventsPort) {
		return eventsPort;
	}

	try {
		const port = chrome.runtime.connect({ name: "nube-devtools-events" });
		port.onDisconnect.addListener(() => {
			eventsPort = null;
		});
		eventsPort = port;
		return port;
	} catch {
		return null;
	}
}

window.addEventListener("NubeSDKEvents", ((event) => {
	const records = (event as CustomEvent<NubeSDKDevtoolsRecord[]>).detail;
	if (!Array.isArray(records) || records.length === 0) {
		return;
	}

	const port = getEventsPort();
	if (!port) {
		return;
	}

	try {
		port.postMessage({ payload: records });
	} catch {
		// Panel closed between the connect and the post: drop this batch and
		// let the next one open a fresh port.
		eventsPort = null;
	}
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
