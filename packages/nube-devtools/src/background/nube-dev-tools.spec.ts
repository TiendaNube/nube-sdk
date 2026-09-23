/**
 * specs/tla/DevtoolsRequests.tla (FIX_GUARD_COMPONENT_RESULTS off):
 *   Send(fetchComponents) -> executeScript fails (the inspected tab is
 *   navigating, shows an error page or a chrome:// URL) -> the callback
 *   reads `results[0]` of `undefined` and throws -> sendResponse is never
 *   called -> the panel's callback gets `undefined` and throws too.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { handleDevToolsGetComponents } from "./nube-dev-tools";

type ExecuteScriptCallback = (results?: unknown[]) => void;

function installExecuteScript(results: unknown[] | undefined) {
	(globalThis as unknown as { chrome: unknown }).chrome = {
		scripting: {
			executeScript: vi.fn(
				(_options: unknown, callback: ExecuteScriptCallback) => {
					callback(results);
				},
			),
		},
	};
}

describe("handleDevToolsGetComponents", () => {
	afterEach(() => {
		(globalThis as unknown as { chrome: unknown }).chrome = undefined;
	});

	it("answers with the components the page reports", () => {
		const components = { app: { corner_top_right: { type: "txt" } } };
		installExecuteScript([{ result: components }]);
		const sendResponse = vi.fn();

		handleDevToolsGetComponents({ tabId: 1, sendResponse });

		expect(sendResponse).toHaveBeenCalledWith({ status: true, components });
	});

	it("still answers when the script could not run in the tab", () => {
		installExecuteScript(undefined);
		const sendResponse = vi.fn();

		expect(() =>
			handleDevToolsGetComponents({ tabId: 1, sendResponse }),
		).not.toThrow();
		expect(sendResponse).toHaveBeenCalledWith({
			status: true,
			components: {},
		});
	});
});
