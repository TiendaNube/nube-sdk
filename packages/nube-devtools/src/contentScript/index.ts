import type { NubeSDKStorageEvent } from "@/contexts/nube-sdk-storage-context";

window.addEventListener("load", () => {
	chrome.runtime.sendMessage({
		action: "nube-devtools-inject-window-variable",
	});
});

window.addEventListener("DOMContentLoaded", () => {
	chrome.runtime.sendMessage(
		{
			action: "nube-devtools-events-listener",
		},
		() => {
			if (chrome.runtime.lastError) {
				console.error(
					"Error sending nube-devtools-events-listener message:",
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
