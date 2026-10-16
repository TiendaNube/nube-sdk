/**
 * Reads the slot trees from, and points at components on, the inspected
 * page, from the panel.
 */
import {
	type NubeSDKComponentsSnapshot,
	highlightComponents,
	readComponents,
	scrollToComponent,
} from "@/background/scripts";

function inspectedTabId(): number | null {
	const tabId = chrome.devtools?.inspectedWindow?.tabId;
	return typeof tabId === "number" ? tabId : null;
}

export async function readPageComponents(): Promise<NubeSDKComponentsSnapshot | null> {
	const tabId = inspectedTabId();
	if (tabId === null) return null;

	try {
		const results = await chrome.scripting.executeScript({
			target: { tabId },
			world: "MAIN",
			func: readComponents,
		});
		return (
			(results?.[0]?.result as NubeSDKComponentsSnapshot | null | undefined) ??
			null
		);
	} catch {
		// The tab is mid-navigation, or its origin cannot be scripted.
		return null;
	}
}

/** Outlines the elements of `ids` on the page; an empty list clears it. */
export async function highlightPageComponents(
	ids: string[],
	title = "",
	color: "green" | "blue" = "blue",
): Promise<void> {
	const tabId = inspectedTabId();
	if (tabId === null) return;

	try {
		await chrome.scripting.executeScript({
			target: { tabId },
			world: "MAIN",
			func: highlightComponents,
			args: [ids, title, color],
		});
	} catch {
		// Nothing to outline on a page that cannot be scripted.
	}
}

/** Scrolls the page to the first rendered element of `ids`. */
export async function scrollToPageComponent(ids: string[]): Promise<boolean> {
	const tabId = inspectedTabId();
	if (tabId === null) return false;

	try {
		const results = await chrome.scripting.executeScript({
			target: { tabId },
			world: "MAIN",
			func: scrollToComponent,
			args: [ids],
		});
		return results?.[0]?.result === true;
	} catch {
		return false;
	}
}

/**
 * Ids of the element selected in the Elements panel (`$0`) and of its
 * ancestors, innermost first. Every SDK component renders its `__internalId`
 * as its DOM id, so this is what maps a selected element back to a node.
 */
export function readInspectedElementIds(): Promise<string[]> {
	return new Promise((resolve) => {
		chrome.devtools.inspectedWindow.eval(
			`(() => {
				const ids = [];
				for (let el = $0; el && el !== document.body; el = el.parentElement) {
					if (el.id) ids.push(el.id);
				}
				return ids;
			})()`,
			(result, exception) => {
				resolve(
					!exception && Array.isArray(result) ? (result as string[]) : [],
				);
			},
		);
	});
}

/**
 * Selects the first rendered element of `ids` in the Elements panel, where
 * the browser's own Styles pane shows the full cascade for it.
 */
export function inspectPageComponent(ids: string[]): Promise<boolean> {
	// The ids come from the page, so they go in as a JSON literal, never as
	// code.
	const expression = `(() => {
		for (const id of ${JSON.stringify(ids)}) {
			for (const el of document.querySelectorAll('[id="' + CSS.escape(id) + '"]')) {
				if (el.getClientRects().length > 0) {
					inspect(el);
					return true;
				}
			}
		}
		return false;
	})()`;

	return new Promise((resolve) => {
		chrome.devtools.inspectedWindow.eval(expression, (result, exception) => {
			resolve(!exception && result === true);
		});
	});
}
