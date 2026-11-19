/**
 * Every value an app persists through NubeSDK is namespaced with its owner:
 * `app-<owner>-<key>`.
 *
 * The owner is an app id, in one of two shapes: a numeric store-app id or a
 * UUID. The UUID alternative is spelled out rather than folded into a looser
 * character class because it contains the same `-` that separates the owner
 * from the key.
 *
 * A script of a multi-script app runs as `<appId>_<scriptId>`, so the values
 * it keeps for itself (storage scope `"script"`) are owned by that id:
 * `app-<appId>_<scriptId>-<key>`. Values shared by the app's scripts (scope
 * `"app"`) stay under the app id alone.
 *
 * Exported as a source string, not only as a `RegExp`: the functions injected
 * into the page are serialized by `chrome.scripting.executeScript` and cannot
 * close over an imported value, so the pattern travels to them through `args`
 * instead of being duplicated at each injection site.
 */
export const STORAGE_KEY_PATTERN_SOURCE =
	"^app-([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}|\\d+)(?:_(\\d+))?-(.+)$";

export const STORAGE_KEY_PATTERN = new RegExp(STORAGE_KEY_PATTERN_SOURCE);

/**
 * `"script"`: kept by one script of a multi-script app for itself.
 * `"app"`: under the app id, shared by every script of the app. For an app
 * with a single script both scopes land here, since it has one scope only.
 */
export type StorageKeyScope = "app" | "script";

export type ParsedStorageKey = {
	/** The app the entry belongs to, without the script suffix. */
	appId: string;
	/** The script that owns the entry, for `"script"` entries of multi-script apps. */
	scriptId?: string;
	scope: StorageKeyScope;
	/** The key the app itself passed, without the `app-<owner>-` prefix. */
	key: string;
};

/**
 * Splits a raw storage key into its owner and app-facing parts. Returns `null`
 * for anything that does not belong to NubeSDK — the page's own keys and the
 * extension's are expected here and simply not ours to show.
 */
export function parseStorageKey(storageKey: string): ParsedStorageKey | null {
	const match = STORAGE_KEY_PATTERN.exec(storageKey);
	if (!match) return null;

	const [, appId, scriptId, key] = match;
	return scriptId === undefined
		? { appId, scope: "app", key }
		: { appId, scriptId, scope: "script", key };
}
