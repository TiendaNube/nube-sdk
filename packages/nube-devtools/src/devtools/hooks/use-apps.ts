import type { NubeSDKApp } from "@/background/types";
import type { NubeSDKEvent } from "@/contexts/nube-sdk-apps-context";
import { useNubeSDKAppsContext } from "@/contexts/nube-sdk-apps-context";
import { useCallback, useEffect } from "react";

const RETRY_DELAY = 2000;

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
export function useApps(): { apps: NubeSDKEvent[]; refresh: () => void } {
	const { apps, setApps } = useNubeSDKAppsContext();

	const refresh = useCallback(() => {
		chrome.scripting.executeScript(
			{
				target: { tabId: chrome.devtools.inspectedWindow.tabId },
				world: "MAIN",
				func: getApps,
			},
			(results) => {
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
						const timeout = setTimeout(() => {
							refresh();
							clearTimeout(timeout);
						}, RETRY_DELAY);
					}
				} catch (error) {
					setApps([]);
				}
			},
		);
	}, [setApps]);

	useEffect(() => {
		refresh();
	}, [refresh]);

	return { apps, refresh };
}
