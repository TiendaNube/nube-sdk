import type { NubeSDKState } from "../types";

export const resendEvent = (
	appId: string,
	state: NubeSDKState,
	event: string,
) => {
	if (!window.nubeSDK) {
		return false;
	}
	window.nubeSDK.send(appId, event, () => ({
		...state,
	}));
	return true;
};
