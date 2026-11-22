/**
 * The Components page's "Show slots" toggle. What draws the slots is
 * `public/inject-show-slots.js`, which runs on every page load and reads the
 * flag below; both constants are duplicated there and must stay in sync.
 */
import {
	getPageSessionStorage,
	removePageSessionStorage,
	setPageSessionStorage,
} from "./page-storage";

/** The page `sessionStorage` key that turns the slot labels on. */
export const SHOW_SLOTS_KEY = "nube-devtools-show-slots";

/** The `state.apps` entry the slot labels are rendered under. */
export const SHOW_SLOTS_APP_ID = "nube-devtools-slots";

export async function readShowSlots(): Promise<boolean> {
	return (await getPageSessionStorage(SHOW_SLOTS_KEY)) === "true";
}

/**
 * Turns the labels on or off and reloads the inspected tab: they are only
 * drawn while the page loads, so a reload is what applies the change.
 */
export async function writeShowSlots(enabled: boolean): Promise<boolean> {
	const written = enabled
		? await setPageSessionStorage(SHOW_SLOTS_KEY, "true")
		: await removePageSessionStorage(SHOW_SLOTS_KEY);
	if (!written) return false;

	const tabId = chrome.devtools?.inspectedWindow?.tabId;
	if (typeof tabId === "number") chrome.tabs.reload(tabId);
	return true;
}
