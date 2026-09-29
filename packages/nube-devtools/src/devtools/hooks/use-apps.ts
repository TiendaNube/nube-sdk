import type { NubeSDKApp } from "@/background/types";
import type { NubeSDKEvent } from "@/contexts/nube-sdk-apps-context";
import { useNubeSDKAppsContext } from "@/contexts/nube-sdk-apps-context";
import { useCallback, useEffect, useRef, useState } from "react";

const RETRY_DELAY = 2000;
const MIN_REFRESH_FEEDBACK_MS = 500;

const getApps = (): Record<string, NubeSDKApp> => {
	if (window.nubeSDK) {
		return window.nubeSDK.getState().apps;
	}
	return {};
};

/**
 * Reads the apps registered on the inspected page and keeps retrying
 * while none are available.
 */
export function useApps(): {
	apps: NubeSDKEvent[];
	refresh: () => Promise<void>;
	isRefreshing: boolean;
} {
	const { apps, setApps } = useNubeSDKAppsContext();
	const [isRefreshing, setIsRefreshing] = useState(false);
	const isActive = useRef(true);
	const retryTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
	const refreshTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

	const fetchApps = useCallback(() => {
		if (retryTimeout.current) {
			clearTimeout(retryTimeout.current);
			retryTimeout.current = null;
		}
		return new Promise<void>((resolve) => {
			chrome.scripting.executeScript(
				{
					target: { tabId: chrome.devtools.inspectedWindow.tabId },
					world: "MAIN",
					func: getApps,
				},
				(results) => {
					if (!isActive.current) {
						resolve();
						return;
					}
					try {
						const appsResult = results?.[0]?.result as
							| Record<string, NubeSDKApp>
							| undefined;
						const appsKeys = appsResult ? Object.keys(appsResult) : [];

						if (appsKeys.length > 0 && appsResult) {
							setApps(
								appsKeys.map((key) => ({
									id: crypto.randomUUID(),
									data: appsResult[key],
								})),
							);
						} else {
							setApps([]);
							retryTimeout.current = setTimeout(fetchApps, RETRY_DELAY);
						}
					} catch (error) {
						setApps([]);
					} finally {
						resolve();
					}
				},
			);
		});
	}, [setApps]);

	const refresh = useCallback(async () => {
		setIsRefreshing(true);
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
		fetchApps();
		return () => {
			isActive.current = false;
			if (retryTimeout.current) {
				clearTimeout(retryTimeout.current);
				retryTimeout.current = null;
			}
			if (refreshTimeout.current) {
				clearTimeout(refreshTimeout.current);
				refreshTimeout.current = null;
			}
		};
	}, [fetchApps]);

	return { apps, refresh, isRefreshing };
}
