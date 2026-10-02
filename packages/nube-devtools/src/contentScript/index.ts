import type { NubeSDKStorageEvent } from "@/contexts/nube-sdk-storage-context";
import type { NubeSDKCommandRecord } from "@/utils/page-commands";
import type { NubeSDKPerformanceRecord } from "@/utils/page-performance";

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
 * Event stream to the panel. The panel opens the port (`chrome.tabs.connect`)
 * rather than this script: a port this side opened is only announced to the
 * panel through `onConnect`, once, so a panel opened after it — closing and
 * reopening DevTools — never saw it and received nothing until a page reload.
 * Opened by the panel, a port lives exactly as long as the panel, and only
 * the panel inspecting this tab gets one.
 *
 * Nothing is kept here: the history lives in the devtools hook, which the
 * panel reads on its own once this script says it is listening.
 */
const eventsPorts = new Set<chrome.runtime.Port>();

chrome.runtime.onConnect.addListener((port) => {
	if (port.name !== "nube-devtools-events") return;

	eventsPorts.add(port);
	port.onDisconnect.addListener(() => eventsPorts.delete(port));
	// Past this point every dispatch reaches the panel, so a snapshot it
	// takes now leaves no gap.
	port.postMessage({ action: "ready" });
});

window.addEventListener("NubeSDKEvents", ((event) => {
	const records = (event as CustomEvent<NubeSDKDevtoolsRecord[]>).detail;
	if (!Array.isArray(records) || records.length === 0) {
		return;
	}

	for (const port of eventsPorts) {
		try {
			port.postMessage({ payload: records });
		} catch (error) {
			// Losing a batch is acceptable. A port that is gone is dropped by its
			// `onDisconnect`; any other failure (a record the runtime cannot
			// serialize) keeps the port, so one bad batch does not stop the
			// stream.
			console.warn("[nube-devtools] failed to forward event batch", error);
		}
	}
}) as EventListener);

window.addEventListener("NubeSDKErrorEvents", ((event) => {
	const port = chrome.runtime.connect({ name: "nube-devtools-error-events" });
	const payload = event as CustomEvent;
	port.postMessage({
		payload: payload.detail,
	});
}) as EventListener);

/**
 * Storage mutations are grouped per microtask and each group is sent over a new
 * port, which the panel closes after reading it.
 *
 * A single long-lived port would not work: the panel only sees ports through
 * `chrome.runtime.onConnect`, which fires once per connection. Apps usually
 * write while the page boots, before the panel is listening, so that first port
 * would stay invisible to the panel and every later batch would be lost. One
 * port per batch means the panel starts receiving as soon as it opens.
 *
 * Batching keeps that cheap: a burst of `setItem` calls costs one connection,
 * not one per call.
 */
const pendingStorageEvents: NubeSDKStorageEvent[] = [];
let storageFlushScheduled = false;

function flushStorageEvents() {
	storageFlushScheduled = false;
	if (pendingStorageEvents.length === 0) {
		return;
	}

	const batch = pendingStorageEvents.splice(0, pendingStorageEvents.length);

	try {
		const port = chrome.runtime.connect({
			name: "nube-devtools-storage-events",
		});
		port.postMessage({ payload: batch });
	} catch (error) {
		console.warn("[nube-devtools] failed to forward storage batch", error);
	}
}

window.addEventListener("NubeSDKStorageEvents", ((event: Event) => {
	const payload = event as CustomEvent<NubeSDKStorageEvent>;
	if (!payload.detail) {
		return;
	}

	pendingStorageEvents.push(payload.detail);
	if (storageFlushScheduled) {
		return;
	}
	storageFlushScheduled = true;
	queueMicrotask(flushStorageEvents);
}) as EventListener);

/**
 * Command bridge calls, forwarded the same way as storage mutations — one port
 * per microtask batch, for the same reason: the first calls happen while the
 * page boots, before the panel is listening.
 *
 * A call is reported twice (started, settled) under one id, and the panel
 * upserts, so a batch carrying both is fine.
 */
const pendingCommandRecords: NubeSDKCommandRecord[] = [];
let commandFlushScheduled = false;

function flushCommandRecords() {
	commandFlushScheduled = false;
	if (pendingCommandRecords.length === 0) {
		return;
	}

	const batch = pendingCommandRecords.splice(0, pendingCommandRecords.length);

	try {
		const port = chrome.runtime.connect({
			name: "nube-devtools-command-events",
		});
		port.postMessage({ payload: batch });
	} catch (error) {
		console.warn("[nube-devtools] failed to forward command batch", error);
	}
}

window.addEventListener("NubeSDKCommandEvents", ((event: Event) => {
	const payload = event as CustomEvent<NubeSDKCommandRecord>;
	if (!payload.detail) {
		return;
	}

	pendingCommandRecords.push(payload.detail);
	if (commandFlushScheduled) {
		return;
	}
	commandFlushScheduled = true;
	queueMicrotask(flushCommandRecords);
}) as EventListener);

/**
 * Performance measurements, forwarded the same way as command calls — one
 * port per microtask batch, since most of them are taken while the page
 * boots, before the panel is listening.
 */
const pendingPerformanceRecords: NubeSDKPerformanceRecord[] = [];
let performanceFlushScheduled = false;

function flushPerformanceRecords() {
	performanceFlushScheduled = false;
	if (pendingPerformanceRecords.length === 0) {
		return;
	}

	const batch = pendingPerformanceRecords.splice(
		0,
		pendingPerformanceRecords.length,
	);

	try {
		const port = chrome.runtime.connect({
			name: "nube-devtools-performance-events",
		});
		port.postMessage({ payload: batch });
	} catch (error) {
		console.warn("[nube-devtools] failed to forward performance batch", error);
	}
}

window.addEventListener("NubeSDKPerformanceEvents", ((event: Event) => {
	const payload = event as CustomEvent<NubeSDKPerformanceRecord>;
	if (!payload.detail) {
		return;
	}

	pendingPerformanceRecords.push(payload.detail);
	if (performanceFlushScheduled) {
		return;
	}
	performanceFlushScheduled = true;
	queueMicrotask(flushPerformanceRecords);
}) as EventListener);
