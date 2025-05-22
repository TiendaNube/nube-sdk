import { useConsoleEventsContext } from "@/contexts/console-events-context";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

type ConsoleMethod = "log" | "info" | "warn" | "error" | "debug";

export type ConsoleMessage = {
	type: "console";
	app: string;
	method: ConsoleMethod;
	args: unknown[];
};

export function useConsoleScript() {
	const { setEvents } = useConsoleEventsContext();

	useEffect(() => {
		chrome.scripting.executeScript({
			target: { tabId: chrome.devtools.inspectedWindow.tabId },
			world: "MAIN",
			func: () => {
				if (!window.__NUBE_SDK_CONSOLE_LISTENER) {
					window.__NUBE_SDK_CONSOLE_LISTENER = (event) => {
						const data = event.data as ConsoleMessage;
						if (data.type === "console") {
							window.dispatchEvent(
								new CustomEvent("NubeSDKConsoleEvents", {
									detail: data,
								}),
							);
						}
					};
				}
				for (const app of window?.__NUBE_SDK_APPS__ || []) {
					app.worker.addEventListener(
						"message",
						window.__NUBE_SDK_CONSOLE_LISTENER,
					);
				}
			},
		});

		return () => {
			chrome.scripting.executeScript({
				target: { tabId: chrome.devtools.inspectedWindow.tabId },
				world: "MAIN",
				func: () => {
					if (window.__NUBE_SDK_CONSOLE_LISTENER) {
						for (const app of window.__NUBE_SDK_APPS__ || []) {
							app.worker.removeEventListener(
								"message",
								window.__NUBE_SDK_CONSOLE_LISTENER,
							);
						}
						// biome-ignore lint/performance/noDelete: <explanation>
						delete window.__NUBE_SDK_CONSOLE_LISTENER;
					}
				},
			});
		};
	}, []);

	useEffect(() => {
		const listener = (port: chrome.runtime.Port) => {
			if (port.name === "nube-devtools-console-events") {
				port.onMessage.addListener((message) => {
					if (message.payload as ConsoleMessage) {
						setEvents((prev) => [
							...prev,
							{
								id: uuidv4(),
								shown: false,
								data: message.payload as ConsoleMessage,
							},
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
}
