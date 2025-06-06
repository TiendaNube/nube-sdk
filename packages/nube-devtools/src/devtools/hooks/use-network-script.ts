import { useNetworkEventsContext } from "@/contexts/network-events-context";
import { useEffect } from "react";

export type FetchAuditMessage = {
	type: "fetch:start" | "fetch:end" | "fetch:fail";
	app?: string;
	method?: string;
	url?: string;
	status?: number;
	duration?: number;
	success?: boolean;
	error?: unknown;
	requestId: string;
	options?: RequestInit;
};

export function useNetworkScript() {
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
					app.worker.addEventListener(
						"message",
						window.__NUBE_SDK_NETWORK_LISTENER,
					);
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
						setEvents((prev) => {
							const existingEventIndex = prev.findIndex(
								(event) => event.id === message.payload.requestId,
							);

							if (existingEventIndex !== -1) {
								const updatedEvents = [...prev];
								updatedEvents[existingEventIndex] = {
									...updatedEvents[existingEventIndex],
									data: message.payload as FetchAuditMessage,
								};
								return updatedEvents;
							}

							return [
								...prev,
								{
									id: message.payload.requestId,
									data: message.payload as FetchAuditMessage,
									shown: false,
								},
							];
						});
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
