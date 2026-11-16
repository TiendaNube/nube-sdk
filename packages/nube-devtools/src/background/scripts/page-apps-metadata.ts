/**
 * Function injected into the inspected page's MAIN world to read the
 * metadata the store keeps about its NubeSDK apps (`GET /nubesdk/devtools/apps/`).
 *
 * It takes no imports on purpose: `chrome.scripting.executeScript`
 * serializes the function body and drops its scope.
 */

/** One app as `GET /nubesdk/devtools/apps/` describes it. */
export type NubeSDKAppMetadata = {
	app: {
		/** Same value as the app's key in the SDK state. */
		id: string;
		handle: string | null;
		/** The app's name in its first registered language. */
		name: string | null;
		installed_at: string | null;
	};
	partner: {
		id: number | null;
		name: string | null;
	};
	script: {
		id: number;
		/** Same value as the app's `script` in the SDK state. */
		src: string;
		location: string;
		version: number | null;
		version_activated_at: string | null;
		created_at: string | null;
		updated_at: string | null;
	};
};

/**
 * - `ok`: the store answered, `apps` is its list.
 * - `unavailable`: the store has no such endpoint (not a storefront, or an
 *   older one): an HTTP error status.
 * - `error`: the request itself failed (network, invalid body).
 */
export type NubeSDKAppsMetadataStatus = "ok" | "unavailable" | "error";

/** What is kept in the page's sessionStorage between requests. */
export type NubeSDKAppsMetadataEntry = {
	/** When the last request was made, successful or not (epoch ms). */
	fetchedAt: number;
	status: NubeSDKAppsMetadataStatus;
	/** HTTP status of the last request, when there was a response. */
	httpStatus?: number;
	/** The last list the store answered: kept when a later request fails. */
	apps: NubeSDKAppMetadata[];
};

export type NubeSDKAppsMetadataResult = NubeSDKAppsMetadataEntry & {
	/** Whether this call made the request (`network`) or reused the entry. */
	source: "network" | "cache";
};

/**
 * Returns the apps metadata of the page's store, requesting it at most once
 * per `minIntervalMs` per tab.
 *
 * The throttle lives in the page — `sessionStorage`, scoped to the tab and
 * the store's origin — because the panel does not: it reloads with every
 * document the tab opens. Failed requests count too, so a page without the
 * endpoint is not asked again on each navigation.
 *
 * Calls that overlap share one request.
 */
export const syncAppsMetadata = async (
	storageKey: string,
	endpoint: string,
	minIntervalMs: number,
	devtoolsHeaderName: string,
	devtoolsHeaderValue: string,
): Promise<NubeSDKAppsMetadataResult> => {
	type Entry = NubeSDKAppsMetadataEntry;
	type Result = NubeSDKAppsMetadataResult;
	type PendingWindow = Window & {
		__NUBE_DEVTOOLS_APPS_METADATA_PENDING__?: Promise<Result>;
	};

	const pageWindow = window as PendingWindow;

	const readEntry = (): Entry | null => {
		try {
			const raw = window.sessionStorage.getItem(storageKey);
			if (!raw) return null;
			const parsed = JSON.parse(raw) as Partial<Entry> | null;
			if (
				!parsed ||
				typeof parsed.fetchedAt !== "number" ||
				!Array.isArray(parsed.apps)
			) {
				return null;
			}
			return {
				fetchedAt: parsed.fetchedAt,
				status: parsed.status ?? "error",
				httpStatus: parsed.httpStatus,
				apps: parsed.apps,
			};
		} catch {
			return null;
		}
	};

	const writeEntry = (entry: Entry) => {
		try {
			window.sessionStorage.setItem(storageKey, JSON.stringify(entry));
		} catch {
			// Storage blocked or full: the result still reaches the panel.
		}
	};

	const cached = readEntry();
	if (cached && Date.now() - cached.fetchedAt < minIntervalMs) {
		return { ...cached, source: "cache" };
	}

	if (pageWindow.__NUBE_DEVTOOLS_APPS_METADATA_PENDING__) {
		return pageWindow.__NUBE_DEVTOOLS_APPS_METADATA_PENDING__;
	}

	const request = (async (): Promise<Result> => {
		const previousApps = cached?.apps ?? [];
		const fetchedAt = Date.now();
		let entry: Entry;

		try {
			const response = await fetch(endpoint, {
				headers: {
					[devtoolsHeaderName]: devtoolsHeaderValue,
					Accept: "application/json",
				},
				credentials: "same-origin",
				cache: "no-store",
			});

			if (!response.ok) {
				entry = {
					fetchedAt,
					status: "unavailable",
					httpStatus: response.status,
					apps: previousApps,
				};
			} else {
				const body = (await response.json()) as { apps?: unknown } | null;
				entry = Array.isArray(body?.apps)
					? {
							fetchedAt,
							status: "ok",
							httpStatus: response.status,
							apps: body.apps as Entry["apps"],
						}
					: {
							fetchedAt,
							status: "error",
							httpStatus: response.status,
							apps: previousApps,
						};
			}
		} catch {
			entry = { fetchedAt, status: "error", apps: previousApps };
		}

		writeEntry(entry);
		return { ...entry, source: "network" };
	})();

	pageWindow.__NUBE_DEVTOOLS_APPS_METADATA_PENDING__ = request;
	try {
		return await request;
	} finally {
		pageWindow.__NUBE_DEVTOOLS_APPS_METADATA_PENDING__ = undefined;
	}
};
