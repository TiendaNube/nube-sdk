/**
 * Metadata about the inspected store's NubeSDK apps — name, partner and
 * script version — from the store's `GET /nubesdk/devtools/apps/`.
 *
 * The SDK state only knows an app by its id and script url. This is the one
 * place the panel gets anything more, and the request is throttled in the
 * page (see `syncAppsMetadata`): callers just ask, as often as they like.
 */
import {
	DEVTOOLS_HEADER_NAME,
	DEVTOOLS_HEADER_VALUE,
} from "@/background/devtools-header";
import {
	type NubeSDKAppMetadata,
	type NubeSDKAppsMetadataEntry,
	type NubeSDKAppsMetadataResult,
	type NubeSDKAppsMetadataStatus,
	syncAppsMetadata,
} from "@/background/scripts";

export type {
	NubeSDKAppMetadata,
	NubeSDKAppsMetadataEntry,
	NubeSDKAppsMetadataResult,
	NubeSDKAppsMetadataStatus,
};

/** Page sessionStorage key holding the last answer and when it was asked. */
export const APPS_METADATA_STORAGE_KEY = "nube-devtools-apps-metadata";

/** Trailing slash included: the storefront redirects the bare path. */
export const APPS_METADATA_ENDPOINT = "/nubesdk/devtools/apps/";

/** The store is asked at most once a minute per tab. */
export const APPS_METADATA_MIN_INTERVAL_MS = 60_000;

/**
 * The inspected store's apps metadata, from the page's sessionStorage when
 * it was fetched less than a minute ago, from the store otherwise.
 *
 * @returns null when the page cannot be scripted (mid-navigation, or an
 * origin the extension has no access to).
 */
export async function getAppsMetadata(): Promise<NubeSDKAppsMetadataResult | null> {
	const tabId = chrome.devtools?.inspectedWindow?.tabId;
	if (typeof tabId !== "number") return null;

	try {
		const results = await chrome.scripting.executeScript({
			target: { tabId },
			world: "MAIN",
			func: syncAppsMetadata,
			args: [
				APPS_METADATA_STORAGE_KEY,
				APPS_METADATA_ENDPOINT,
				APPS_METADATA_MIN_INTERVAL_MS,
				DEVTOOLS_HEADER_NAME,
				DEVTOOLS_HEADER_VALUE,
			],
		});
		return (
			(results?.[0]?.result as NubeSDKAppsMetadataResult | undefined) ?? null
		);
	} catch {
		return null;
	}
}

/** The apps metadata keyed by app id, the key the SDK state uses. */
export function indexAppsMetadata(
	apps: NubeSDKAppMetadata[],
): Record<string, NubeSDKAppMetadata> {
	const byId: Record<string, NubeSDKAppMetadata> = {};
	for (const metadata of apps) {
		const id = metadata?.app?.id;
		if (typeof id === "string" && id !== "") byId[id] = metadata;
	}
	return byId;
}

/**
 * How the panel names an app: `{name} by {partner}`.
 *
 * The app's name falls back to its handle, and the partner part is dropped
 * when the store has no partner name for it.
 *
 * @returns null when there is nothing better than the app id to show.
 */
export function formatAppLabel(
	metadata: NubeSDKAppMetadata | undefined,
): string | null {
	if (!metadata) return null;

	const appName = metadata.app?.name || metadata.app?.handle;
	if (!appName) return null;

	const partnerName = metadata.partner?.name;
	return partnerName ? `${appName} by ${partnerName}` : appName;
}
