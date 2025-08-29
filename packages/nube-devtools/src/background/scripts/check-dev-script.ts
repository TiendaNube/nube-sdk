import type { NubeSDKApp } from "../types";

/**
 * Check if a specific script is loaded in the nubeSDK
 */
export const checkDevScript = (scriptUrl: string): boolean => {
	if (!window.nubeSDK) {
		return false;
	}

	const apps = window.nubeSDK.getState().apps;
	const foundApp = (Object.values(apps) as NubeSDKApp[]).find(
		(app) => app.script === scriptUrl,
	);

	return !!foundApp;
};
