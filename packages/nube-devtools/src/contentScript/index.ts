import type { NubeSDKStorageEvent } from "@/contexts/nube-sdk-storage-context";

interface NubeSDKEventDetail {
	data: unknown[];
}

window.addEventListener("load", () => {
	chrome.runtime.sendMessage({
		action: "nube-devtools-initialize-sdk",
	});

	// Check for nubeSDK and notify background
	setTimeout(() => {
		if (window.nubeSDK) {
			chrome.runtime.sendMessage({
				action: "nube-devtools-sdk-detected",
			});
		}
	}, 1000);
});

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

window.addEventListener("NubeSDKStorageEvents", ((event: Event) => {
	const payload = event as CustomEvent<NubeSDKStorageEvent>;
	const port = chrome.runtime.connect({ name: "nube-devtools-storage-events" });
	port.postMessage({
		payload: payload.detail,
	});
}) as EventListener);
