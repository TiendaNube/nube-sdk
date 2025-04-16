interface NubeSDKApp {
	id: string;
	registered: boolean;
	script: string;
}

interface HandleDevToolsGetAppsResponse {
	status: boolean;
	apps?: Record<string, NubeSDKApp>;
}

interface NubeSDKState {
	[key: string]: unknown;
}

interface HandleDevToolsResendEventParams {
	state: NubeSDKState;
	event: string;
	appId: string;
	tabId: number;
}

export const handleDevToolsVerifyNubeSdkStatus = ({
	sendResponse,
	tabId,
}: {
	sendResponse: (response: HandleDevToolsGetAppsResponse) => void;
	tabId: number;
}) => {
  chrome.scripting.executeScript(
    {
      target: { tabId },
      world: "MAIN",
      func: () => {
        return !!window.nubeSDK;
      },
    },
    (results) => {
      try {
        const status = results?.[0]?.result;
        sendResponse({ status });
      } catch (error) {
        sendResponse({ status: false });
      }
    },
  );
};

export const handleDevToolsInjectEventListeners = ({
	sendResponse,
	tabId,
}: {
	sendResponse: (response: HandleDevToolsGetAppsResponse) => void;
	tabId: number;
}) => {
	chrome.scripting.executeScript(
		{
			target: { tabId },
			world: "MAIN",
			func: () => {
				if (window.nubeSDK) {
					window.nubeSDK.on("*", async (...state: NubeSDKState[]) => {
						window.dispatchEvent(
							new CustomEvent("NubeSDKEvents", {
								detail: state,
							}),
						);
					});
				}

				const localStorageProxy = new Proxy(window.localStorage, {
					get(target, prop: string | symbol) {
						if (prop === "length") {
							return target.length;
						}
						if (prop === "getItem") {
							return (key: string) => {
								const value = target.getItem(key);
								const pattern = /^app-(\d+)-(.+)$/;
								const match = key.match(pattern);
								if (match) {
									window.dispatchEvent(
										new CustomEvent("NubeSDKLocalStorageEvent", {
											detail: {
												method: "getItem",
												type: "localStorage",
												key,
												value,
											},
										}),
									);
								}
								return value;
							};
						}
						if (prop === "setItem") {
							return (key: string, value: string) => {
								target.setItem(key, value);
								const pattern = /^app-(\d+)-(.+)$/;
								const match = key.match(pattern);
								if (match) {
									window.dispatchEvent(
										new CustomEvent("NubeSDKLocalStorageEvent", {
											detail: {
												method: "setItem",
												type: "localStorage",
												key,
												value,
											},
										}),
									);
								}
							};
						}
						if (prop === "clear") {
							return () => {
								window.dispatchEvent(
									new CustomEvent("NubeSDKLocalStorageEvent", {
										detail: {
											method: "clear",
											type: "localStorage",
											key: "",
											value: "{}",
										},
									}),
								);
								return target.clear();
							};
						}
						if (prop === "removeItem") {
							return (key: string) => {
								const value = target.removeItem(key);
								const pattern = /^app-(\d+)-(.+)$/;
								const match = key.match(pattern);
								if (match) {
									window.dispatchEvent(
										new CustomEvent("NubeSDKLocalStorageEvent", {
											detail: {
												method: "removeItem",
												type: "localStorage",
												key,
												value: "{}",
											},
										}),
									);
								}
								return value;
							};
						}
						return target[prop as keyof Storage];
					},
				});

				Object.defineProperty(window, "localStorage", {
					value: localStorageProxy,
					writable: true,
					configurable: true,
				});
			},
		},
		() => {
			sendResponse({ status: true });
		},
	);
};

export const handleDevToolsInjectWindowVariable = (tabId: number) => {
	chrome.scripting.executeScript(
		{
			target: { tabId },
			world: "MAIN",
			func: () => {
				window.__NUBE_DEVTOOLS_EXTENSION__ = !!window.nubeSDK;
			},
		},
		() => {},
	);
};

export const handleDevToolsGetApps = ({
	tabId,
	sendResponse,
}: {
	tabId: number;
	sendResponse: (response: HandleDevToolsGetAppsResponse) => void;
}) => {
	chrome.scripting.executeScript(
		{
			target: { tabId },
			world: "MAIN",
			func: () => {
				if (window.nubeSDK) {
					return window.nubeSDK.getState().apps;
				}
				return [];
			},
		},
		(results) => {
			const apps = results[0].result;
			if (apps) {
				sendResponse({ status: true, apps });
			} else {
				sendResponse({ status: true, apps: {} });
			}
		},
	);
};

export const handleDevToolsResendEvent = (
	sendResponse: (response: HandleDevToolsGetAppsResponse) => void,
	{ state, event, appId, tabId }: HandleDevToolsResendEventParams,
) => {
	chrome.scripting.executeScript(
		{
			target: { tabId },
			world: "MAIN",
			func: (appId, state, event) => {
				window.nubeSDK.send(appId, event, () => ({
					...(state as NubeSDKState),
				}));
				return true;
			},
			args: [appId, state, event],
		},
		() => {
			try {
				sendResponse({ status: true });
			} catch (error) {
				sendResponse({ status: false });
			}
		},
	);
};
