type NubeSDKApp = {
	id: string;
	registered: boolean;
	script: string;
};

export type NubeSDKComponent = {
	type: string;
	children?: Array<NubeSDKComponent> | NubeSDKComponent;
	__internalId?: string;
	props: Record<string, unknown>;
};

type NubeSDKState = {
	[key: string]: unknown;
};

type HandleDevToolsResendEventParams = {
	state: NubeSDKState;
	event: string;
	appId: string;
	tabId: number;
};

export const handleDevToolsVerifyNubeSdkStatus = ({
	sendResponse,
	tabId,
}: {
	sendResponse: (response: { status: boolean }) => void;
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

export const handleDevToolsEvents = ({
	tabId,
}: {
	tabId: number;
}) => {
	chrome.scripting.executeScript(
		{
			target: { tabId },
			world: "MAIN",
			func: () => {
				if (window.__NUBE_DEVTOOLS_EXTENSION_CUSTOM_EVENTS__ || !window.nubeSDK) {
					return;
				}

        window.nubeSDK.on("*", async (...state: NubeSDKState[]) => {
          window.dispatchEvent(
            new CustomEvent("NubeSDKEvents", {
              detail: state,
            }),
          );
        });

				const getStorageProxy = (type: "localStorage" | "sessionStorage") =>
					new Proxy(window[type], {
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
											new CustomEvent("NubeSDKStorageEvents", {
												detail: {
													method: "getItem",
													type,
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
											new CustomEvent("NubeSDKStorageEvents", {
												detail: {
													method: "setItem",
													type,
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
										new CustomEvent("NubeSDKStorageEvents", {
											detail: {
												method: "clear",
												type,
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
											new CustomEvent("NubeSDKStorageEvents", {
												detail: {
													method: "removeItem",
													type,
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

				const localStorageProxy = getStorageProxy("localStorage");
				const sessionStorageProxy = getStorageProxy("sessionStorage");

				Object.defineProperty(window, "localStorage", {
					value: localStorageProxy,
					writable: true,
					configurable: true,
				});

				Object.defineProperty(window, "sessionStorage", {
					value: sessionStorageProxy,
					writable: true,
					configurable: true,
				});

				window.__NUBE_DEVTOOLS_EXTENSION_CUSTOM_EVENTS__ = true;
			},
		},
		() => {},
	);
};

export const handleDevToolsInjectWindowVariable = (tabId: number) => {
	chrome.scripting.executeScript({
		target: { tabId },
		world: "MAIN",
		func: () => {
			window.__NUBE_DEVTOOLS_EXTENSION__ = !!window.nubeSDK;
		},
	});
};

export const handleDevToolsGetApps = ({
	tabId,
	sendResponse,
}: {
	tabId: number;
	sendResponse: (response: {
		status: boolean;
		apps?: Record<string, NubeSDKApp>;
	}) => void;
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
			const apps = results?.[0]?.result;
			if (apps) {
				sendResponse({ status: true, apps });
			} else {
				sendResponse({ status: true, apps: {} });
			}
		},
	);
};

export const handleDevToolsGetComponents = ({
	tabId,
	sendResponse,
}: {
	tabId: number;
	sendResponse: (response: {
		status: boolean;
		components?: {
			[key: string]: Record<string, NubeSDKComponent>;
		};
	}) => void;
}) => {
	chrome.scripting.executeScript(
		{
			target: { tabId },
			world: "MAIN",
			func: () => {
				if (window.nubeSDK) {
					const apps = window.nubeSDK.getState().apps;
					return Object.keys(apps).reduce<
						Record<string, Record<string, NubeSDKComponent>>
					>((acc, appId) => {
						acc[appId] = apps[appId].ui.slots;
						return acc;
					}, {});
				}
				return {};
			},
		},
		(results) => {
			const components = results[0].result;
			if (components) {
				sendResponse({ status: true, components });
			} else {
				sendResponse({ status: true, components: {} });
			}
		},
	);
};

export const handleDevToolsResendEvent = (
	sendResponse: (response: { status: boolean }) => void,
	{ state, event, appId, tabId }: HandleDevToolsResendEventParams,
) => {
	chrome.scripting.executeScript(
		{
			target: { tabId },
			world: "MAIN",
			func: (appId, state, event) => {
				if (!window.nubeSDK) {
					return false;
				}
				window.nubeSDK.send(appId, event, () => ({
					...(state as NubeSDKState),
				}));
				return true;
			},
			args: [appId, state, event],
		},
		(results) => {
			const success = results?.[0]?.result === true;
			sendResponse({ status: success });
		},
	);
};

export const handleDevToolsHighlightElement = ({
	tabId,
	id,
	type,
	color,
	sendResponse,
}: {
	tabId: number;
	id: string;
	type: "enter" | "leave";
	color: "green" | "blue";
	sendResponse: (response: { status: boolean }) => void;
}) => {
	chrome.scripting.executeScript(
		{
			target: { tabId },
			world: "MAIN",
			func: (id: string, type: "enter" | "leave", color: "green" | "blue") => {
				const element = document.getElementById(id);
				if (element) {
					const overlay = document.createElement("div");
					overlay.id = "nube-devtools-highlight";
					if (type === "enter") {
						const rect = element.getBoundingClientRect();
						const scrollLeft =
							window.scrollX || document.documentElement.scrollLeft;
						const scrollTop =
							window.scrollY || document.documentElement.scrollTop;

						const absoluteLeft = rect.left + scrollLeft;
						const absoluteTop = rect.top + scrollTop;

						overlay.style.position = "absolute";
						overlay.style.top = `${absoluteTop}px`;
						overlay.style.left = `${absoluteLeft}px`;
						overlay.style.width = `${rect.width}px`;
						overlay.style.height = `${rect.height}px`;
						overlay.style.border =
							color === "green"
								? "1px dashed rgba(124, 219, 110, 0.75)"
								: "1px dashed rgba(111, 168, 220, 0.75)";
						overlay.style.backgroundColor =
							color === "green"
								? "rgba(124, 219, 110, 0.15)"
								: "rgba(111, 168, 220, 0.15)";
						overlay.style.pointerEvents = "none";

						document.body.appendChild(overlay);
					} else {
						const overlay = document.getElementById("nube-devtools-highlight");
						if (overlay) {
							document.body.removeChild(overlay);
						}
					}
				}
				return true;
			},
			args: [id, type, color],
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

export const handleDevToolsScrollToElement = ({
	tabId,
	id,
	sendResponse,
}: {
	tabId: number;
	id: string;
	sendResponse: (response: { status: boolean }) => void;
}) => {
	chrome.scripting.executeScript(
		{
			target: { tabId },
			world: "MAIN",
			func: (id: string) => {
				const element = document.getElementById(id);
				if (element) {
					element.scrollIntoView({
						behavior: "smooth",
						block: "start",
					});
					const topPos = element.offsetTop;
					window.scrollTo({
						top: topPos,
						behavior: "smooth",
					});
				}
				return true;
			},
			args: [id],
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
