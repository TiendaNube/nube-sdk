/**
 * Functions injected into the inspected page's MAIN world to read and mutate
 * the storages NubeSDK apps persist to.
 *
 * They take no imports on purpose: `chrome.scripting.executeScript`
 * serializes the function body and drops its scope, so everything they need
 * arrives through `args`.
 */

export type PageStorageType = "localStorage" | "sessionStorage";

export type PageStorageEntry = {
	type: PageStorageType;
	/** Full key as it exists in the page's storage, namespace included. */
	key: string;
	value: string;
};

/**
 * Snapshots every NubeSDK entry currently in the page's storages. This is what
 * makes the panel show state that was written before devtools was even open —
 * something the write patch alone can never report.
 */
export const readStorage = (
	storageKeyPatternSource: string,
): PageStorageEntry[] => {
	const pattern = new RegExp(storageKeyPatternSource);
	const entries: PageStorageEntry[] = [];

	const collect = (type: PageStorageType, storage: Storage) => {
		// Enumerated through `length`/`key()` rather than `Object.keys`: those
		// are the spec's own enumeration and the devtools patch leaves them
		// alone, so a snapshot cannot be skewed by the instrumentation.
		for (let index = 0; index < storage.length; index++) {
			const key = storage.key(index);
			if (key === null || !pattern.test(key)) continue;
			const value = storage.getItem(key);
			if (value === null) continue;
			entries.push({ type, key, value });
		}
	};

	// One try per storage: an origin can have one blocked and the other
	// usable, and a throw on the first must not hide the second.
	try {
		collect("localStorage", window.localStorage);
	} catch {
		// Storage denied for this origin — nothing to report.
	}
	try {
		collect("sessionStorage", window.sessionStorage);
	} catch {
		// Storage denied for this origin — nothing to report.
	}

	return entries;
};

/**
 * Writes through the page's own `setItem`, which the devtools patch wraps: the
 * write echoes back as a storage event, so a panel edit takes exactly the same
 * path as an app's write and needs no special casing downstream.
 */
export const writeStorage = (
	type: PageStorageType,
	key: string,
	value: string,
): boolean => {
	try {
		window[type].setItem(key, value);
		return true;
	} catch {
		// Quota exceeded, or storage denied for this origin.
		return false;
	}
};

export const removeStorage = (type: PageStorageType, key: string): boolean => {
	try {
		window[type].removeItem(key);
		return true;
	} catch {
		return false;
	}
};

export const getStorageItem = (
	type: PageStorageType,
	key: string,
): string | null => {
	try {
		return window[type].getItem(key);
	} catch {
		return null;
	}
};
