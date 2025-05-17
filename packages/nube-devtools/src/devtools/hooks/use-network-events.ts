import { useNetworkEventsContext } from "@/contexts/network-events-context";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export type FetchAuditMessage =
	| {
			type: "fetch:start";
			app: string;
			method: string;
			url: string;
			options?: RequestInit;
	  }
	| {
			type: "fetch:end";
			app: string;
			method: string;
			url: string;
			duration: number;
			success: true;
			status: number;
	  }
	| {
			type: "fetch:fail";
			app: string;
			method: string;
			url: string;
			duration: number;
			success: false;
			error: unknown;
	  };

export function useNetworkEvents() {
	const { setEvents } = useNetworkEventsContext();

	useEffect(() => {
		chrome.scripting.executeScript({
			target: { tabId: chrome.devtools.inspectedWindow.tabId },
			world: "MAIN",
			func: () => {
				if (!window.__NUBE_SDK_NETWORK_LISTENER) {
					window.__NUBE_SDK_NETWORK_LISTENER = (event) => {
						const data = event.data as FetchAuditMessage;
						if (data?.type?.startsWith("fetch:")) {
							window.dispatchEvent(
								new CustomEvent("NubeSDKFetchAuditEvents", {
									detail: data,
								}),
							);
						}
					};
				}
				for (const app of window?.__NUBE_SDK_APPS__ || []) {
					app.worker.addEventListener("message", window.__NUBE_SDK_NETWORK_LISTENER);
				}
			},
		});

		return () => {
			chrome.scripting.executeScript({
				target: { tabId: chrome.devtools.inspectedWindow.tabId },
				world: "MAIN",
				func: () => {
					if (window.__NUBE_SDK_NETWORK_LISTENER) {
						for (const app of window?.__NUBE_SDK_APPS__ || []) {
							app.worker.removeEventListener(
								"message",
								window.__NUBE_SDK_NETWORK_LISTENER,
							);
						}
						// biome-ignore lint/performance/noDelete: <explanation>
						delete window.__NUBE_SDK_NETWORK_LISTENER;
					}
				},
			});
		};
	}, []);

	useEffect(() => {
		const listener = (port: chrome.runtime.Port) => {
			if (port.name === "nube-devtools-network-events") {
				port.onMessage.addListener((message) => {
					if (message.payload as FetchAuditMessage) {
						setEvents((prev) => [
							...prev,
							{ id: uuidv4(), data: message.payload as FetchAuditMessage },
						]);
						port.disconnect();
					}
				});
			}
		};

		chrome.runtime.onConnect.addListener(listener);

		return () => {
			chrome.runtime.onConnect.removeListener(listener);
		};
	}, [setEvents]);

	const clear = () => {
		setEvents([]);
	};
}
