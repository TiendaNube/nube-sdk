import type { NubeSDKStorageEvent } from "@/contexts/nube-sdk-storage-context";
import type { FetchAuditMessage } from "@/devtools/hooks/use-network-events";

window.addEventListener("DOMContentLoaded", () => {
	chrome.runtime.sendMessage({
		action: "nube-devtools-initialize-sdk",
	});
});

window.addEventListener("DOMContentLoaded", () => {
	chrome.runtime.sendMessage({
		action: "nube-devtools-monitor-events",
	});
	return true;
});

interface NubeSDKEventDetail {
	data: unknown[];
}

window.addEventListener("NubeSDKEvents", ((event) => {
	const port = chrome.runtime.connect({ name: "nube-devtools-events" });
	const payload = event as CustomEvent<NubeSDKEventDetail>;
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

window.addEventListener("NubeSDKConsoleEvents", ((event: Event) => {
	const payload = event as CustomEvent;
	const port = chrome.runtime.connect({ name: "nube-devtools-console-events" });
	port.postMessage({
		payload: payload.detail,
	});
}) as EventListener);

window.addEventListener("NubeSDKFetchAuditEvents", ((event: Event) => {
	const payload = event as CustomEvent<FetchAuditMessage>;
	const port = chrome.runtime.connect({ name: "nube-devtools-network-events" });
	port.postMessage({
		payload: payload.detail,
	});
}) as EventListener);