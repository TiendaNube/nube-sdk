/**
 * What Local Mode shares between the panel page, the popup and the watcher
 * that reloads the page when the local bundle changes.
 */
import { getPageSessionStorage } from "./page-storage";

/**
 * Page-side record the register reads on boot (`attach.ts` in the register):
 * which app to inject or patch, and with which script.
 */
export const LOCAL_MODE_PAGE_STORAGE_KEY = "nube-devtools-application-server";

export const DEFAULT_APP_URL = "http://localhost:8080/main.min.js";

export type LocalModeType = "new" | "existing";

export type LocalModeStoredData = {
	script?: string;
	connected?: boolean;
	appId?: string;
	type?: LocalModeType;
};

export function isValidUrl(url: string): boolean {
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
}

/** The Local Mode record of the inspected page, or null when there is none. */
export async function readLocalModeData(): Promise<LocalModeStoredData | null> {
	const stored = await getPageSessionStorage(LOCAL_MODE_PAGE_STORAGE_KEY);
	if (!stored) return null;
	try {
		return JSON.parse(stored) as LocalModeStoredData;
	} catch {
		return null;
	}
}

/**
 * Whether the page should be reloaded when the local bundle changes.
 *
 * A panel preference, not a page one: it is about how this developer works,
 * so it holds across stores and tabs. Announced with an event because the
 * `storage` event does not fire in the document that made the change, and
 * the toggle and the watcher live in the same document.
 */
const AUTO_RELOAD_STORAGE_KEY = "nube-devtools-local-mode-auto-reload";
export const AUTO_RELOAD_CHANGE_EVENT = "nube-devtools-local-mode-auto-reload";

export function readAutoReloadEnabled(): boolean {
	try {
		// Opt-out: reloading on change is what makes Local Mode a dev loop.
		return localStorage.getItem(AUTO_RELOAD_STORAGE_KEY) !== "false";
	} catch {
		return true;
	}
}

export function writeAutoReloadEnabled(enabled: boolean): void {
	try {
		localStorage.setItem(AUTO_RELOAD_STORAGE_KEY, String(enabled));
	} catch {
		// Falls back to the default next time; nothing else depends on it.
	}
	window.dispatchEvent(new CustomEvent(AUTO_RELOAD_CHANGE_EVENT));
}

/**
 * A fingerprint of the bundle at `url`, or null when it could not be read:
 * `tsup --watch` with `clean` deletes the output for an instant while it
 * rebuilds, and a 404 there is not a change to react to.
 *
 * Hashed from the body rather than taken from `ETag`/`Last-Modified`: not
 * every dev server sends them, and a body hash is what "changed" means.
 */
export async function fingerprintScript(url: string): Promise<string | null> {
	try {
		const response = await fetch(url, { cache: "no-store" });
		if (!response.ok) return null;
		const text = await response.text();

		// djb2: enough to tell two builds apart, and cheap on a bundle.
		let hash = 5381;
		for (let index = 0; index < text.length; index++) {
			hash = ((hash << 5) + hash + text.charCodeAt(index)) | 0;
		}
		return `${text.length}:${hash}`;
	} catch {
		return null;
	}
}
