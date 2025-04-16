import { useState, useEffect } from "react";

export const useNubeStatus = () => {
	const [nubeStatus, setNubeStatus] = useState<boolean>(false);

	useEffect(() => {
		const checkNubeStatus = () => {
			chrome.runtime.sendMessage(
				{
					action: "nube-devtools-verify-nube-sdk-status",
					payload: { tabId: chrome.devtools.inspectedWindow.tabId },
				},
				(response) => {
					if (response?.status) {
						setNubeStatus(() => response.status);
					}
				},
			);
		};

		checkNubeStatus();
	}, []);

	return nubeStatus;
};
