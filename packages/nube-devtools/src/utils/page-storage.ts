/**
 * Utilities to read/write the **page's** sessionStorage from the extension.
 * The popup runs in the extension context; this runs code in the active tab (MAIN world).
 */

/**
 * Sets a value in the sessionStorage of the currently active tab (the site the user is viewing).
 * Requires the user to have opened the popup from that tab (activeTab permission).
 *
 * @param key - sessionStorage key
 * @param value - sessionStorage value
 * @returns Promise that resolves to true if successful, false if no tab or script failed
 */
export async function setPageSessionStorage(
	key: string,
	value: string,
): Promise<boolean> {
	const [tab] = await chrome.tabs.query({
		active: true,
		currentWindow: true,
	});
	if (!tab?.id) return false;

	try {
		await chrome.scripting.executeScript({
			target: { tabId: tab.id },
			world: "MAIN",
			func: (k: string, v: string) => {
				sessionStorage.setItem(k, v);
			},
			args: [key, value],
		});
		return true;
	} catch {
		return false;
	}
}

/**
 * Removes a key from the sessionStorage of the currently active tab.
 *
 * @param key - sessionStorage key to remove
 * @returns Promise that resolves to true if successful
 */
export async function removePageSessionStorage(key: string): Promise<boolean> {
	const [tab] = await chrome.tabs.query({
		active: true,
		currentWindow: true,
	});
	if (!tab?.id) return false;

	try {
		await chrome.scripting.executeScript({
			target: { tabId: tab.id },
			world: "MAIN",
			func: (k: string) => {
				sessionStorage.removeItem(k);
			},
			args: [key],
		});
		return true;
	} catch {
		return false;
	}
}

/**
 * Gets a value from the sessionStorage of the currently active tab.
 *
 * @param key - sessionStorage key
 * @returns Promise with the value or null if not found / error
 */
export async function getPageSessionStorage(
	key: string,
): Promise<string | null> {
	const [tab] = await chrome.tabs.query({
		active: true,
		currentWindow: true,
	});
	if (!tab?.id) return null;

	try {
		const results = await chrome.scripting.executeScript({
			target: { tabId: tab.id },
			world: "MAIN",
			func: (k: string) => sessionStorage.getItem(k),
			args: [key],
		});
		return (results?.[0]?.result as string | undefined) ?? null;
	} catch {
		return null;
	}
}
