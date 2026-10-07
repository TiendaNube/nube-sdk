import { getApps } from "@/background/scripts";
import type { NubeSDKApp } from "@/background/types";
import type { NubeSDKEvent } from "@/contexts/nube-sdk-apps-context";
import { useNubeSDKAppsContext } from "@/contexts/nube-sdk-apps-context";
import { useNubeSDKEventsContext } from "@/contexts/nube-sdk-events-context";
import { executeInPage } from "@/lib/page-bridge";
import { useCallback, useEffect, useRef, useState } from "react";

const RETRY_DELAY = 2000;
/**
 * Fallback polling budget. Apps normally arrive through the events stream; the
 * page is only read directly for the ones registered before the panel was
 * listening, and it is given up on once the page has had time to boot.
 */
const MAX_ATTEMPTS = 5;
const MIN_REFRESH_FEEDBACK_MS = 500;

type AppsRecord = Record<string, NubeSDKApp>;

/**
 * `apps` is internal runtime state, missing from the public `NubeSDKState`.
 */
const readAppsFromState = (state: unknown): AppsRecord | null => {
	const apps = (state as { apps?: unknown } | null)?.apps;
	return apps && typeof apps === "object" ? (apps as AppsRecord) : null;
};

// A stable id keeps the selection across updates.
const toEvents = (apps: AppsRecord): NubeSDKEvent[] =>
	Object.entries(apps).map(([key, app]) => ({ id: app.id ?? key, data: app }));

const sameApps = (a: NubeSDKEvent[], b: NubeSDKEvent[]) =>
	a.length === b.length &&
	a.every(
		(app, index) =>
			app.id === b[index].id &&
			app.data.registered === b[index].data.registered &&
			app.data.script === b[index].data.script,
	);

/**
 * Tracks the apps registered on the inspected page.
 *
 * Every devtools record carries the state it produced, so the list follows
 * the runtime as each app registers. The page is also read once on mount,
 * retrying briefly while empty, to cover a panel opened after the records it
 * would have needed were dispatched.
 */
export function useApps(): {
	apps: NubeSDKEvent[];
	/** False until the page has reported its apps or given up trying. */
	isLoaded: boolean;
	refresh: () => Promise<void>;
	isRefreshing: boolean;
} {
	const { apps, setApps } = useNubeSDKAppsContext();
	const { events } = useNubeSDKEventsContext();
	const [isLoaded, setIsLoaded] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const isActive = useRef(true);
	const attempts = useRef(0);
	const retryTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
	const refreshTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

	const clearRetry = useCallback(() => {
		if (retryTimeout.current) {
			clearTimeout(retryTimeout.current);
			retryTimeout.current = null;
		}
	}, []);

	const updateApps = useCallback(
		(next: NubeSDKEvent[]) => {
			// Records land in bursts; an unchanged list is not worth a render.
			setApps((previous) => (sameApps(previous, next) ? previous : next));
			if (next.length > 0) {
				clearRetry();
				setIsLoaded(true);
			}
		},
		[setApps, clearRetry],
	);

	const fetchApps = useCallback(() => {
		clearRetry();
		attempts.current += 1;
		return new Promise<void>((resolve) => {
			executeInPage({
				tabId: chrome.devtools.inspectedWindow.tabId,
				func: getApps,
			})
				.catch(() => undefined)
				.then((results) => {
					if (!isActive.current) {
						resolve();
						return;
					}
					try {
						const appsResult = results?.[0]?.result as AppsRecord | undefined;
						const next = appsResult ? toEvents(appsResult) : [];
						updateApps(next);

						if (next.length === 0) {
							if (attempts.current < MAX_ATTEMPTS) {
								retryTimeout.current = setTimeout(fetchApps, RETRY_DELAY);
							} else {
								setIsLoaded(true);
							}
						}
					} catch {
						setIsLoaded(true);
					} finally {
						resolve();
					}
				});
		});
	}, [updateApps, clearRetry]);

	const latestEvent = events[events.length - 1];

	useEffect(() => {
		const appsFromState = readAppsFromState(latestEvent?.record.next);
		if (appsFromState) {
			updateApps(toEvents(appsFromState));
		}
	}, [latestEvent, updateApps]);

	const refresh = useCallback(async () => {
		setIsRefreshing(true);
		attempts.current = MAX_ATTEMPTS - 1;
		await Promise.all([
			fetchApps(),
			new Promise<void>((resolve) => {
				refreshTimeout.current = setTimeout(resolve, MIN_REFRESH_FEEDBACK_MS);
			}),
		]);
		if (isActive.current) {
			setIsRefreshing(false);
		}
	}, [fetchApps]);

	useEffect(() => {
		isActive.current = true;
		attempts.current = 0;
		fetchApps();
		return () => {
			isActive.current = false;
			clearRetry();
			if (refreshTimeout.current) {
				clearTimeout(refreshTimeout.current);
				refreshTimeout.current = null;
			}
		};
	}, [fetchApps, clearRetry]);

	return { apps, isLoaded, refresh, isRefreshing };
}
