import type { NubeSDKStorageEvent } from "@/contexts/nube-sdk-storage-context";

window.addEventListener("load", () => {
	chrome.runtime.sendMessage({
		action: "nube-devtools-initialize-sdk",
	});
});

window.addEventListener("DOMContentLoaded", () => {
	chrome.runtime.sendMessage(
		{
			action: "nube-devtools-monitor-events",
		},
		() => {
			if (chrome.runtime.lastError) {
				console.error(
					"Error sending nube-devtools-monitor-events message:",
					chrome.runtime.lastError,
				);
			}
		},
	);
	return false;
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
