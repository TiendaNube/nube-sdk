/**
 * Injected into the inspected page's MAIN world on every load. It forwards the
 * runtime's devtools records and instruments the storages NubeSDK apps write
 * to.
 *
 * `storageKeyPatternSource` is passed in rather than declared here because
 * `chrome.scripting.executeScript` serializes this function without its scope:
 * receiving it through `args` keeps one definition of the key format
 * (`src/utils/storage-key.ts`) shared with the panel.
 */
export const handleEvents = (storageKeyPatternSource: string) => {
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
	// `length` and index access keep working as the browser implements them —
	// which is what lets the panel snapshot the storages by enumeration.
	//
	// Only the mutating methods are wrapped. `getItem` is deliberately left
	// alone: the panel models storage as state, not as a log of calls, so a read
	// has nothing to contribute — and reporting one would invent a record for a
	// key that does not exist.
	const storageKeyPattern = new RegExp(storageKeyPatternSource);

	const notify = (detail: {
		method: "setItem" | "removeItem" | "clear";
		type: "localStorage" | "sessionStorage";
		key: string;
		value: string | null;
	}) => {
		try {
			window.dispatchEvent(
				new CustomEvent("NubeSDKStorageEvents", {
					// Stamped at the source: this is the only point where the real
					// time of the write is known. Entries the panel finds already in
					// storage carry no timestamp at all, and it says so instead of
					// passing their discovery time off as a write time.
					detail: { ...detail, timestamp: Date.now() },
				}),
			);
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

	// The spec coerces the key, so `setItem(null, v)` is a valid write to the
	// "null" key and store code does it — coercing here keeps `.test` alive.
	const shouldReport = (key: unknown) => storageKeyPattern.test(String(key));

	// `localStorage` is shared across every tab of the origin, so another tab
	// can change an entry without any call landing on this document. The native
	// `storage` event is the only report of that, and it fires exclusively on
	// the documents that did not perform the write — no overlap with the patch
	// below, so no double-reporting.
	window.addEventListener("storage", (event) => {
		const area = event.storageArea;
		const type = area ? storageTypeOf(area) : null;
		if (!type) return;

		// A null key is how the spec reports `clear()`.
		if (event.key === null) {
			notify({ method: "clear", type, key: "", value: null });
			return;
		}

		if (!shouldReport(event.key)) return;

		if (event.newValue === null) {
			notify({ method: "removeItem", type, key: event.key, value: null });
			return;
		}

		notify({
			method: "setItem",
			type,
			key: event.key,
			value: event.newValue,
		});
	});

	const proto = window.Storage?.prototype;
	const PATCH_FLAG = "__nubeDevtoolsStoragePatched__";

	if (proto && !Object.prototype.hasOwnProperty.call(proto, PATCH_FLAG)) {
		const original = {
			setItem: proto.setItem,
			removeItem: proto.removeItem,
			clear: proto.clear,
		};

		// Original first, report after: a write that throws is never reported.
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
					value: null,
				});
			}
		};

		proto.clear = function clear() {
			original.clear.call(this);
			const type = storageTypeOf(this);
			// No key to match against, and it wipes app entries along with the
			// page's own, so `clear` is always reported: the panel drops every
			// record it holds for that storage.
			if (type) {
				notify({ method: "clear", type, key: "", value: null });
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
