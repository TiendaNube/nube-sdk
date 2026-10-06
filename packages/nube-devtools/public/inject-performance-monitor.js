/**
 * Collects performance data from NubeSDK app workers for the Performance
 * panel.
 *
 * Registered by the service worker to run at `document_start` in the MAIN
 * world, before any page script: the register bundle creates the workers while
 * the page boots, and a worker message is only delivered to the listeners
 * already attached when it is posted. Injecting this later (as the other
 * scripts are, on DOMContentLoaded) would lose the first renders and the
 * requests an app makes while it starts.
 *
 * Workers are found through `window.__NUBE_SDK_APPS__`, which the register
 * bundle creates with `window.__NUBE_SDK_APPS__ || []` and pushes each worker
 * to. Pre-creating that array with a `push` of our own lets every worker be
 * watched from the moment it exists.
 *
 * What is read from the workers' messages:
 * - `telemetry:traces`: every `fetch` an app makes. Posted by all SDK builds.
 * - `telemetry:metrics`: app init and slow handlers. Posted only by the
 *   telemetry-enabled SDK builds.
 * - the first `ui:slot:set`: time from worker creation to the app's first
 *   render.
 *
 * The record shape is `NubeSDKPerformanceRecord`
 * (`src/background/scripts/page-performance.ts`). This file is served as is,
 * so the two have to be kept in sync by hand.
 */
(() => {
	if (window.__NUBE_DEVTOOLS_PERFORMANCE__) {
		return;
	}

	const MAX_RECORDS = 1000;
	const buffer = [];
	window.__NUBE_DEVTOOLS_PERFORMANCE__ = buffer;

	// Not `crypto.randomUUID`: it is missing on plain http pages.
	const loadId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
	let seq = 0;

	const report = (record) => {
		const entry = { id: `${loadId}-${seq++}`, ...record };
		buffer.push(entry);
		if (buffer.length > MAX_RECORDS) buffer.shift();

		try {
			window.dispatchEvent(
				new CustomEvent("NubeSDKPerformanceEvents", { detail: entry }),
			);
		} catch {
			// Never throw inside the page's worker message dispatch.
		}
	};

	// Telemetry start times are Unix nanoseconds.
	const toEpochMs = (ns) =>
		typeof ns === "number" && Number.isFinite(ns) ? ns / 1e6 : Date.now();

	const scriptName = (data) => {
		if (data.source === "app-init") {
			return data.type === "long-task" ? "Long task during init" : "App init";
		}
		if (data.source === "event-listener") return `on("${data.event}")`;
		if (data.source === "state-modifier") return `send("${data.event}")`;
		return data.event ? `${data.source} ${data.event}` : data.source;
	};

	const handleTelemetry = (appId, message) => {
		const data = message.data;
		if (!data || typeof data.duration !== "number") return;

		if (message.type === "telemetry:traces") {
			report({
				appId,
				kind: "network",
				source: data.source,
				name: `${data.method} ${data.url}`,
				startedAt: toEpochMs(data.startTime),
				duration: data.duration,
				method: data.method,
				url: data.url,
				status: data.status,
				success: data.success,
				error: data.error,
			});
			return;
		}

		if (message.type === "telemetry:metrics") {
			report({
				appId,
				kind: "script",
				source: data.source,
				metric: data.type,
				name: scriptName(data),
				event: data.event,
				startedAt: toEpochMs(data.startTime),
				duration: data.duration,
			});
		}
	};

	/**
	 * @param entry `{ id, worker }` as the register bundle pushes it.
	 * @param createdAt When the worker was created, or null when it already
	 * existed before this script ran. The first render is only reported with a
	 * known start.
	 */
	const watch = (entry, createdAt) => {
		const worker = entry?.worker;
		if (!worker || typeof worker.addEventListener !== "function") return;

		const appId = String(entry.id);
		let rendered = createdAt === null;

		worker.addEventListener("message", (event) => {
			const raw = event.data;
			if (typeof raw !== "string") return;

			// Checked on the raw string first: workers post every state change
			// and every slot render here, and most of it is none of our business.
			const maybeTelemetry = raw.indexOf('"telemetry:') !== -1;
			const maybeRender = !rendered && raw.indexOf('"ui:slot:set"') !== -1;
			if (!maybeTelemetry && !maybeRender) return;

			let message;
			try {
				message = JSON.parse(raw);
			} catch {
				return;
			}
			if (!message || String(message.app) !== appId) return;

			if (!rendered && message.type === "ui:slot:set") {
				rendered = true;
				report({
					appId,
					kind: "lifecycle",
					source: "first-render",
					name: "First render",
					startedAt: createdAt,
					duration: Date.now() - createdAt,
				});
				return;
			}

			if (
				typeof message.type === "string" &&
				message.type.indexOf("telemetry:") === 0
			) {
				handleTelemetry(appId, message);
			}
		});
	};

	const apps = Array.isArray(window.__NUBE_SDK_APPS__)
		? window.__NUBE_SDK_APPS__
		: [];
	for (const entry of apps) watch(entry, null);

	const push = apps.push;
	Object.defineProperty(apps, "push", {
		value: function (...entries) {
			const now = Date.now();
			for (const entry of entries) watch(entry, now);
			return push.apply(this, entries);
		},
		writable: true,
		configurable: true,
		enumerable: false,
	});
	window.__NUBE_SDK_APPS__ = apps;
})();
