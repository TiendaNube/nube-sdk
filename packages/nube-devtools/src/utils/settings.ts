/**
 * DevTools settings that change how pages load. They live in
 * `chrome.storage.local`, so they apply on every website, and the service
 * worker turns them into network rules (see `background/settings-rules.ts`).
 */
export type DevToolsSettings = {
	/**
	 * Sends `X-Nube-AutoSlots: true`, which makes Core load the auto-slots
	 * adapter on stores with FTP open or on a theme without slots. Never on
	 * together with `forceSdkFromUrl`.
	 */
	forceSdkAutoSlots: boolean;
	/** Loads the vanilla-adapter from `sdkUrl` instead of the one the page requests. */
	forceSdkFromUrl: boolean;
	sdkUrl: string;
};

export const SETTINGS_STORAGE_KEY = "nube-devtools-settings";

/** Message the panel sends the service worker to save the settings. */
export const SAVE_SETTINGS_ACTION = "nube-devtools-save-settings";

export const DEFAULT_SETTINGS: DevToolsSettings = {
	forceSdkAutoSlots: false,
	forceSdkFromUrl: false,
	sdkUrl: "",
};

export function isValidSdkUrl(url: string): boolean {
	try {
		const { protocol } = new URL(url);
		return protocol === "https:" || protocol === "http:";
	} catch {
		return false;
	}
}

/**
 * Fills in missing fields and turns off Force SDK From URL without a valid
 * URL. Only one of the two adapter options stays on, Force SDK From URL first.
 */
export function normalizeSettings(value: unknown): DevToolsSettings {
	const stored =
		value && typeof value === "object"
			? (value as Partial<DevToolsSettings>)
			: {};
	const sdkUrl = typeof stored.sdkUrl === "string" ? stored.sdkUrl.trim() : "";
	const forceSdkFromUrl =
		stored.forceSdkFromUrl === true && isValidSdkUrl(sdkUrl);

	return {
		forceSdkAutoSlots: stored.forceSdkAutoSlots === true && !forceSdkFromUrl,
		forceSdkFromUrl,
		sdkUrl,
	};
}

/**
 * Whether going from `before` to `after` changes how pages load, so the
 * inspected page needs a reload to show it. The URL only matters while Load
 * SDK From URL is on.
 */
export function changesPageLoad(
	before: DevToolsSettings,
	after: DevToolsSettings,
): boolean {
	return (
		before.forceSdkAutoSlots !== after.forceSdkAutoSlots ||
		before.forceSdkFromUrl !== after.forceSdkFromUrl ||
		(after.forceSdkFromUrl && before.sdkUrl !== after.sdkUrl)
	);
}

export async function loadSettings(): Promise<DevToolsSettings> {
	const stored = await chrome.storage.local.get(SETTINGS_STORAGE_KEY);
	return normalizeSettings(stored[SETTINGS_STORAGE_KEY]);
}
