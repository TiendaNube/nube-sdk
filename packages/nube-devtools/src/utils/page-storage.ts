/**
 * Utilities to read/write the **page's** storages from the extension.
 *
 * Both the devtools panel and the popup run outside the page, so every
 * function here executes code in the inspected tab (MAIN world). Going through
 * the page's own `Storage` methods — rather than a separate API — means panel
 * edits are instrumented by the devtools patch exactly like an app's writes.
 */
import {
	type PageStorageEntry,
	type PageStorageType,
	getStorageItem,
	readStorage,
	removeStorage,
	writeStorage,
} from "@/background/scripts";
import { STORAGE_KEY_PATTERN_SOURCE } from "./storage-key";

export type { PageStorageEntry, PageStorageType };

/**
 * The tab to operate on.
 *
 * `chrome.devtools.inspectedWindow.tabId` comes first and is the only correct
 * answer inside the panel: the inspected tab is not necessarily the active one
 * — a detached devtools window makes them differ routinely. The active-tab
 * query is the fallback for the popup, which has no `chrome.devtools` at all.
 */
async function resolveTabId(): Promise<number | null> {
	const inspected = chrome.devtools?.inspectedWindow?.tabId;
	if (typeof inspected === "number") return inspected;

	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	return tab?.id ?? null;
}

/**
 * Snapshots every NubeSDK entry in the page's `localStorage` and
 * `sessionStorage`.
 *
 * This is what the panel opens with: the write patch only ever sees writes
 * that happen while devtools is attached, so without a snapshot everything
 * persisted earlier — which for `localStorage` can be most of it — would be
 * invisible.
 */
export async function readPageStorage(): Promise<PageStorageEntry[]> {
	const tabId = await resolveTabId();
	if (tabId === null) return [];

	try {
		const results = await chrome.scripting.executeScript({
			target: { tabId },
			world: "MAIN",
			func: readStorage,
			args: [STORAGE_KEY_PATTERN_SOURCE],
		});
		return (results?.[0]?.result as PageStorageEntry[] | undefined) ?? [];
	} catch {
		// The tab is mid-navigation, or its origin cannot be scripted.
		return [];
	}
}

/**
 * Sets a value in the given storage of the inspected tab.
 *
 * @returns true if the write went through, false if there is no tab, the
 * script failed, or the page refused the write (quota, blocked storage).
 */
export async function setPageStorage(
	type: PageStorageType,
	key: string,
	value: string,
): Promise<boolean> {
	const tabId = await resolveTabId();
	if (tabId === null) return false;

	try {
		const results = await chrome.scripting.executeScript({
			target: { tabId },
			world: "MAIN",
			func: writeStorage,
			args: [type, key, value],
		});
		return results?.[0]?.result === true;
	} catch {
		return false;
	}
}

/**
 * Removes a key from the given storage of the inspected tab.
 */
export async function removePageStorage(
	type: PageStorageType,
	key: string,
): Promise<boolean> {
	const tabId = await resolveTabId();
	if (tabId === null) return false;

	try {
		const results = await chrome.scripting.executeScript({
			target: { tabId },
			world: "MAIN",
			func: removeStorage,
			args: [type, key],
		});
		return results?.[0]?.result === true;
	} catch {
		return false;
	}
}

/**
 * Gets a value from the given storage of the inspected tab.
 *
 * @returns the value, or null if not found / error.
 */
export async function getPageStorage(
	type: PageStorageType,
	key: string,
): Promise<string | null> {
	const tabId = await resolveTabId();
	if (tabId === null) return null;

	try {
		const results = await chrome.scripting.executeScript({
			target: { tabId },
			world: "MAIN",
			func: getStorageItem,
			args: [type, key],
		});
		return (results?.[0]?.result as string | null | undefined) ?? null;
	} catch {
		return null;
	}
}

// Local mode keeps its own bookkeeping in the page's sessionStorage and has no
// reason to name the storage at every call site.
export const setPageSessionStorage = (key: string, value: string) =>
	setPageStorage("sessionStorage", key, value);

export const removePageSessionStorage = (key: string) =>
	removePageStorage("sessionStorage", key);

export const getPageSessionStorage = (key: string) =>
	getPageStorage("sessionStorage", key);
