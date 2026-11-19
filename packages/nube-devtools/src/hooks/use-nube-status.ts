import {
	NUBE_STATUS_RETRY_DELAY_MS,
	type NubeStatusCheck,
	nextNubeStatusStep,
} from "@/utils/nube-status";
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

/**
 * Whether the inspected page has the NubeSDK: null while it is being checked.
 * The adapter loads async, so a missing SDK is checked again until shortly
 * after the page loads.
 */
export const useNubeStatus = () => {
	const [nubeStatus, setNubeStatus] = useState<boolean | null>(null);

	useEffect(() => {
		let active = true;
		let timer: ReturnType<typeof setTimeout> | undefined;
		const attempts = { total: 0, afterLoad: 0 };

		getTabId((tabId) => {
			if (tabId == null) {
				setNubeStatus(false);
				return;
			}

			const check = () => {
				chrome.runtime.sendMessage(
					{
						action: "nube-devtools-check-nube-status",
						payload: { tabId },
					},
					(response?: NubeStatusCheck) => {
						if (!active) return;
						const result = {
							status: response?.status === true,
							loaded: response?.loaded === true,
						};
						attempts.total++;
						if (result.loaded) attempts.afterLoad++;

						const step = nextNubeStatusStep(result, attempts);
						if (step === "retry") {
							timer = setTimeout(check, NUBE_STATUS_RETRY_DELAY_MS);
						} else {
							setNubeStatus(step === "detected");
						}
					},
				);
			};
			check();
		});

		return () => {
			active = false;
			clearTimeout(timer);
		};
	}, []);

	return nubeStatus;
};
