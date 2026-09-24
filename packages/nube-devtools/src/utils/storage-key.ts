/**
 * Every value an app persists through NubeSDK is namespaced with the app that
 * owns it: `app-<appId>-<key>`.
 *
 * App ids come in two shapes: a numeric store-app id and a UUID. The UUID
 * alternative is spelled out rather than folded into a looser character class
 * because it contains the same `-` that separates the id from the key.
 *
 * Exported as a source string, not only as a `RegExp`: the functions injected
 * into the page are serialized by `chrome.scripting.executeScript` and cannot
 * close over an imported value, so the pattern travels to them through `args`
 * instead of being duplicated at each injection site.
 */
export const STORAGE_KEY_PATTERN_SOURCE =
	"^app-([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}|\\d+)-(.+)$";

export const STORAGE_KEY_PATTERN = new RegExp(STORAGE_KEY_PATTERN_SOURCE);

export type ParsedStorageKey = {
	/** The owning app, as namespaced in the key. */
	appId: string;
	/** The key the app itself passed, without the `app-<appId>-` prefix. */
	key: string;
};

/**
 * Splits a raw storage key into its app and app-facing parts. Returns `null`
 * for anything that does not belong to NubeSDK — the page's own keys and the
 * extension's are expected here and simply not ours to show.
 */
export function parseStorageKey(storageKey: string): ParsedStorageKey | null {
	const match = STORAGE_KEY_PATTERN.exec(storageKey);
	if (!match) return null;
	return { appId: match[1], key: match[2] };
}
