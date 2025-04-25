import type { NubeSDKState } from "../types";

export const handleEvents = () => {
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
};
