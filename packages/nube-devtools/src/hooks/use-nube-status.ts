import { useEffect, useState } from "react";

const getTabId = (callback: (tabId: number | null) => void) => {
	if (
		typeof chrome !== "undefined" &&
		chrome.devtools?.inspectedWindow?.tabId != null
	) {
		callback(chrome.devtools.inspectedWindow.tabId);
		return;
	}
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		callback(tabs[0]?.id ?? null);
	});
};

export const useNubeStatus = () => {
	const [nubeStatus, setNubeStatus] = useState<boolean>(false);

	useEffect(() => {
		getTabId((tabId) => {
			if (tabId == null) return;
			chrome.runtime.sendMessage(
				{
					action: "nube-devtools-check-nube-status",
					payload: { tabId },
				},
				(response) => {
					if (response?.status) {
						setNubeStatus(() => response.status);
					}
				},
			);
		});
	}, []);

	return nubeStatus;
};
