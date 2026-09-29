/**
 * Functions injected into the inspected page's MAIN world to observe the
 * command bridge — the channel `nube.api.*` calls travel through, from an
 * app's worker to the handlers the host (or the SDK itself) registered with
 * `nubeSDK.command.add`.
 *
 * They take no imports on purpose: `chrome.scripting.executeScript`
 * serializes the function body and drops its scope.
 */

export type NubeSDKCommandStatus = "pending" | "success" | "error";

/**
 * Error codes as the worker receives them. Mirrors
 * `INTERNAL_COMMAND_ERROR_CODES` in the SDK, which maps the store's typed
 * exceptions onto these.
 */
export type NubeSDKCommandErrorCode =
	| "unknown_command"
	| "timeout"
	| "command_failed";

/**
 * One call through the command bridge. Reported once when it starts and again,
 * under the same `id`, when it settles.
 */
export type NubeSDKCommandRecord = {
	id: string;
	/** The app whose worker issued the call, as the dispatcher attributes it. */
	appId: string;
	scope: string;
	command: string;
	params?: unknown;
	status: NubeSDKCommandStatus;
	/** What the app receives, after the wire's JSON round trip. */
	result?: unknown;
	error?: { code: NubeSDKCommandErrorCode; message: string };
	startedAt: number;
	/**
	 * Milliseconds until the call settled, or null while pending. Includes the
	 * store's late-registration retry window, which is part of what the app
	 * waits for.
	 */
	duration: number | null;
};

/**
 * Instruments `window.nubeSDK.command.execute` and reports every call as a
 * `NubeSDKCommandEvents` CustomEvent.
 *
 * `execute` is patched rather than the worker traffic: it is the one place
 * every command goes through, the dispatcher looks it up on the store at each
 * call — so a patch applied after the workers exist still takes effect — and
 * it is handed the `app_id` the SDK attributes the call to, which the wire
 * request deliberately does not carry.
 *
 * Every record is also kept on the window (`__NUBE_DEVTOOLS_COMMANDS__`) so
 * a panel opened after the calls were made can still read them: the panel
 * reloads on each navigation, which is after most calls a page boot makes.
 */
export const handleCommands = (maxRecords: number) => {
	if (window.__NUBE_DEVTOOLS_COMMANDS__) {
		return;
	}
	// Claimed up front: this is injected on every page load and would
	// double-report if it ever ran twice on the same document.
	const buffer: NubeSDKCommandRecord[] = [];
	window.__NUBE_DEVTOOLS_COMMANDS__ = buffer;

	const PATCH_FLAG = "__nubeDevtoolsCommandsPatched__";

	// Same cloning the wire applies: whatever the panel shows is what the app
	// gets back. It also keeps the CustomEvent detail crossing into the content
	// script's world free of anything structured clone rejects.
	const toWireValue = (value: unknown): unknown => {
		if (value === undefined) return undefined;
		try {
			const json = JSON.stringify(value);
			return json === undefined ? undefined : JSON.parse(json);
		} catch {
			return String(value);
		}
	};

	const toWireError = (
		error: unknown,
	): NonNullable<NubeSDKCommandRecord["error"]> => {
		const name = (error as { name?: unknown } | null)?.name;
		if (name === "UnknownCommandError") {
			return { code: "unknown_command", message: (error as Error).message };
		}
		if (name === "CommandTimeoutError") {
			return { code: "timeout", message: (error as Error).message };
		}
		return { code: "command_failed", message: String(error) };
	};

	const report = (record: NubeSDKCommandRecord) => {
		const index = buffer.findIndex((entry) => entry.id === record.id);
		if (index === -1) {
			buffer.push(record);
			if (buffer.length > maxRecords) buffer.shift();
		} else {
			buffer[index] = record;
		}

		try {
			window.dispatchEvent(
				new CustomEvent("NubeSDKCommandEvents", { detail: record }),
			);
		} catch {
			// Never throw inside a command the page is running.
		}
	};

	type CommandStore = {
		execute: (
			scope: string,
			command: string,
			args: { params?: unknown; app_id: string },
		) => Promise<unknown>;
	};

	const patch = (store: CommandStore) => {
		if (Object.prototype.hasOwnProperty.call(store, PATCH_FLAG)) return;

		const original = store.execute;

		store.execute = function execute(scope, command, args) {
			const startedAt = Date.now();
			const start = performance.now();
			const pending: NubeSDKCommandRecord = {
				id: crypto.randomUUID(),
				appId: String(args?.app_id ?? ""),
				scope: String(scope),
				command: String(command),
				params: toWireValue(args?.params),
				status: "pending",
				startedAt,
				duration: null,
			};
			report(pending);

			const settle = (
				outcome: Pick<NubeSDKCommandRecord, "status" | "result" | "error">,
			) =>
				report({
					...pending,
					...outcome,
					duration: performance.now() - start,
				});

			let promise: Promise<unknown>;
			try {
				promise = original.call(this, scope, command, args);
			} catch (error) {
				settle({ status: "error", error: toWireError(error) });
				throw error;
			}

			// Observed on a branch of its own: the caller gets the original
			// promise back untouched, and the rejection handler here keeps this
			// branch from surfacing as an unhandled rejection.
			Promise.resolve(promise).then(
				(result) => settle({ status: "success", result: toWireValue(result) }),
				(error) => settle({ status: "error", error: toWireError(error) }),
			);

			return promise;
		};

		// Holds the original so the patch can be undone from the console.
		Object.defineProperty(store, PATCH_FLAG, {
			value: original,
			writable: false,
			enumerable: false,
			configurable: true,
		});
	};

	const findStore = (): CommandStore | null => {
		const store = window.nubeSDK?.command;
		return store && typeof store.execute === "function" ? store : null;
	};

	const store = findStore();
	if (store) {
		patch(store);
		return;
	}

	// The register bundle has not attached yet. It creates the store before it
	// registers any app, and a worker takes far longer than this interval to
	// boot and issue its first call, so polling here loses nothing in
	// practice. It gives up eventually on pages that never load NubeSDK.
	const POLL_INTERVAL = 50;
	const POLL_TIMEOUT = 60_000;
	const pollStartedAt = Date.now();
	const interval = setInterval(() => {
		const found = findStore();
		if (found) {
			clearInterval(interval);
			patch(found);
			return;
		}
		if (Date.now() - pollStartedAt > POLL_TIMEOUT) {
			clearInterval(interval);
		}
	}, POLL_INTERVAL);
};

/** Snapshot of the calls recorded on this document, oldest first. */
export const readCommands = (): NubeSDKCommandRecord[] =>
	window.__NUBE_DEVTOOLS_COMMANDS__?.slice() ?? [];

/** Empties the page-side history, so a later snapshot does not bring it back. */
export const clearCommands = (): boolean => {
	window.__NUBE_DEVTOOLS_COMMANDS__?.splice(0);
	return true;
};
