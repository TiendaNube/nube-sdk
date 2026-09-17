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

	// Patched on `Storage.prototype` rather than by replacing the `window`
	// globals with a Proxy: the real Storage objects stay in place, so `key()`,
	// `length` and index access keep working as the browser implements them.

	// App ids come in two shapes: a numeric store-app id and a UUID. The UUID
	// alternative is spelled out rather than folded into a looser character
	// class because it contains the same `-` that separates id from key.
	const STORAGE_KEY_PATTERN =
		/^app-([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}|\d+)-(.+)$/;

	const notify = (detail: {
		method: string;
		type: "localStorage" | "sessionStorage";
		key: string;
		value: string | null;
	}) => {
		try {
			window.dispatchEvent(new CustomEvent("NubeSDKStorageEvents", { detail }));
		} catch {
			// Never throw inside a storage call the page made.
		}
	};

	// One prototype, two storages: the type is resolved per call. Reading the
	// globals can throw in a sandboxed frame, and a Storage from elsewhere is
	// passed through unreported.
	const storageTypeOf = (
		storage: Storage,
	): "localStorage" | "sessionStorage" | null => {
		try {
			if (storage === window.localStorage) return "localStorage";
			if (storage === window.sessionStorage) return "sessionStorage";
		} catch {}
		return null;
	};

	// The spec coerces the key, so `getItem(null)` is a valid read of the
	// "null" key and store code does it — coercing here keeps `.match` alive.
	const shouldReport = (key: unknown) => STORAGE_KEY_PATTERN.test(String(key));

	const proto = window.Storage?.prototype;
	const PATCH_FLAG = "__nubeDevtoolsStoragePatched__";

	if (proto && !Object.prototype.hasOwnProperty.call(proto, PATCH_FLAG)) {
		const original = {
			getItem: proto.getItem,
			setItem: proto.setItem,
			removeItem: proto.removeItem,
			clear: proto.clear,
		};

		// Original first, report after: a write that throws is never reported.
		proto.getItem = function getItem(key: string) {
			const value = original.getItem.call(this, key);
			const type = storageTypeOf(this);
			if (type && shouldReport(key)) {
				notify({ method: "getItem", type, key: String(key), value });
			}
			return value;
		};

		proto.setItem = function setItem(key: string, value: string) {
			original.setItem.call(this, key, value);
			const type = storageTypeOf(this);
			if (type && shouldReport(key)) {
				notify({
					method: "setItem",
					type,
					key: String(key),
					value: String(value),
				});
			}
		};

		proto.removeItem = function removeItem(key: string) {
			original.removeItem.call(this, key);
			const type = storageTypeOf(this);
			if (type && shouldReport(key)) {
				notify({
					method: "removeItem",
					type,
					key: String(key),
					value: "{}",
				});
			}
		};

		proto.clear = function clear() {
			original.clear.call(this);
			const type = storageTypeOf(this);
			// No key to match against, so `clear` is always reported.
			if (type) {
				notify({ method: "clear", type, key: "", value: "{}" });
			}
		};

		// Holds the originals so the patch can be undone from the console.
		Object.defineProperty(proto, PATCH_FLAG, {
			value: original,
			writable: false,
			enumerable: false,
			configurable: true,
		});
	}
};
