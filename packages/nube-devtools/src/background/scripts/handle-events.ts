export const handleEvents = () => {
	if (window.__NUBE_DEVTOOLS_EXTENSION_CUSTOM_EVENTS__) {
		return;
	}
	// Claimed up front: this function is injected on every page load and both
	// the hook subscription and the storage proxy below would double-report if
	// it ever ran twice on the same document.
	window.__NUBE_DEVTOOLS_EXTENSION_CUSTOM_EVENTS__ = true;

	// Dispatches are batched into a single `NubeSDKEvents` per microtask. The
	// runtime hook replays its whole buffer synchronously on subscribe, so
	// without batching a page load would open one port per historic event.
	const pending: NubeSDKDevtoolsRecord[] = [];
	let flushScheduled = false;

	const flush = () => {
		flushScheduled = false;
		if (pending.length === 0) {
			return;
		}

		const batch = pending.splice(0, pending.length);
		window.dispatchEvent(
			new CustomEvent("NubeSDKEvents", {
				detail: batch,
			}),
		);

		for (const record of batch) {
			if (record.event !== "WebWorkerError") continue;
			// Kept as a single-item array: the errors panel reads
			// `payload[0].apps`, the shape the old `on("WebWorkerError")`
			// listener produced.
			window.dispatchEvent(
				new CustomEvent("NubeSDKErrorEvents", {
					detail: [record.next],
				}),
			);
		}
	};

	const collect = (record: NubeSDKDevtoolsRecord) => {
		pending.push(record);
		if (flushScheduled) return;
		flushScheduled = true;
		queueMicrotask(flush);
	};

	const hook = window.__NUBE_SDK_DEVTOOLS_HOOK__;

	if (hook) {
		// The runtime is already loaded: subscribing also replays everything
		// dispatched before this script was injected (`init`, `app:register`,
		// `app:registered`), which a `nubeSDK.on("*")` listener could never see.
		hook.subscribe(collect);
	} else {
		// The runtime bundle has not run yet. It honors a hook that is already
		// on the window, so installing a forwarding one here removes the race
		// entirely — no polling, and no event dispatched before the runtime
		// finishes loading is lost.
		let seq = 0;
		window.__NUBE_SDK_DEVTOOLS_HOOK__ = {
			emit: (event) => collect({ ...event, seq: seq++ }),
			// Nothing is buffered on this side: records go straight to the
			// panel, which keeps the list.
			records: () => [],
			subscribe: () => () => {},
		};
	}

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
};
