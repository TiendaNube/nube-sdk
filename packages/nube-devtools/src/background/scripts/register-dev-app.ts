/**
 * Register a new development app in the nubeSDK
 */
export const registerDevApp = (scriptUrl: string): boolean => {
	if (!window.nubeSDK) {
		return false;
	}

	try {
		window.nubeSDK.send("nube-devtools", "app:register", () => ({
			apps: {
				local: {
					id: "local",
					script: scriptUrl,
				},
			},
		}));
		return true;
	} catch (error) {
		console.error("Error registering development app:", error);
		return false;
	}
};
