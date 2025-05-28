import { useEffect, useState } from "react";

export const useNubeStatus = () => {
	const [nubeStatus, setNubeStatus] = useState<boolean>(false);

	useEffect(() => {
		const checkNubeStatus = () => {
			chrome.runtime.sendMessage(
				{
					action: "nube-devtools-check-nube-status",
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
