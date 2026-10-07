import {
	PAGE_SCRIPTS,
	type PageScriptName,
} from "@/background/scripts/registry";

export const EXECUTE_IN_PAGE_ACTION = "nube-devtools-execute-in-page";
export const TAB_RELAY_PORT = "nube-devtools-tab-relay";

type PageScript = (typeof PAGE_SCRIPTS)[PageScriptName];

const scriptNames = new Map<PageScript, PageScriptName>(
	Object.entries(PAGE_SCRIPTS).map(
		([name, func]) => [func, name] as [PageScript, PageScriptName],
	),
);

type ExecuteInPageResponse =
	| { ok: true; results: chrome.scripting.InjectionResult<unknown>[] }
	| { ok: false; error: string };

/**
 * Runs one of `PAGE_SCRIPTS` in the inspected tab's MAIN world.
 *
 * Chrome lets the panel call `chrome.scripting` itself. Firefox does not
 * expose it to devtools pages, so there the call goes through the background.
 */
export async function executeInPage<Args extends unknown[]>({
	tabId,
	func,
	args,
}: {
	tabId: number;
	func: (...args: Args) => unknown;
	args?: Args;
}): Promise<chrome.scripting.InjectionResult<unknown>[]> {
	if (chrome.scripting?.executeScript) {
		return chrome.scripting.executeScript({
			target: { tabId },
			world: "MAIN",
			func,
			args: args ?? ([] as unknown as Args),
		}) as Promise<chrome.scripting.InjectionResult<unknown>[]>;
	}

	const name = scriptNames.get(func as unknown as PageScript);
	if (!name) {
		throw new Error("[nube-devtools] function is not in PAGE_SCRIPTS");
	}

	const response: ExecuteInPageResponse | undefined =
		await chrome.runtime.sendMessage({
			action: EXECUTE_IN_PAGE_ACTION,
			payload: { tabId, name, args: args ?? [] },
		});
	if (!response?.ok) {
		throw new Error(response?.error ?? "[nube-devtools] no response");
	}
	return response.results;
}

/**
 * Opens a port to the content script of `tabId`.
 *
 * Without `chrome.tabs` (Firefox devtools pages) the port goes to the
 * background, which opens the real one and relays both ways.
 */
export function connectToTab(tabId: number, name: string): chrome.runtime.Port {
	if (chrome.tabs?.connect) {
		return chrome.tabs.connect(tabId, { name });
	}
	return chrome.runtime.connect({
		name: `${TAB_RELAY_PORT}:${tabId}:${name}`,
	});
}
