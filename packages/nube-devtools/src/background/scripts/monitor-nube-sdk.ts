const offIconPaths = {
	16: "logo-off/logo-16.png",
	32: "logo-off/logo-32.png",
	48: "logo-off/logo-48.png",
	128: "logo-off/logo-128.png",
};

const onIconPaths = {
	16: "logo-on/logo-16.png",
	32: "logo-on/logo-32.png",
	48: "logo-on/logo-48.png",
	128: "logo-on/logo-128.png",
};

export const checkNubeSDKPresence = async (tabId: number): Promise<boolean> => {
	try {
		const results = await chrome.scripting.executeScript({
			target: { tabId },
			world: "MAIN",
			func: () => {
				return !!window.nubeSDK;
			},
		});

		const hasNubeSDK = results?.[0]?.result === true;
		return hasNubeSDK;
	} catch {
		return false;
	}
};

const setIcon = async (iconPaths: Record<number, string>, tabId?: number) => {
	const params = tabId ? { tabId, path: iconPaths } : { path: iconPaths };
	await chrome.action.setIcon(params);
};

export const updateIconBadge = async (tabId: number, hasNubeSDK: boolean) => {
	try {
		if (hasNubeSDK) {
			await Promise.all([setIcon(onIconPaths, tabId)]);
		} else {
			await Promise.all([setIcon(offIconPaths, tabId)]);
		}
	} catch {
		// Silently ignore errors
	}
};
