import { getPageSessionStorage } from "@/utils";
import {
	type StoredApplicationServerData,
	getLocalModeEntryIds,
	readScriptUrls,
} from "@/utils/local-mode-scripts";
import { useEffect, useState } from "react";

const PAGE_STORAGE_KEY_DEVTOOLS_APPLICATION =
	"nube-devtools-application-server";

export type LocalModeApp = {
	appId: string;
	type: "new" | "existing";
	/** Ids of the entries it runs as: `appId`, or `<appId>_<scriptId>` each. */
	entryIds: string[];
};

/**
 * Returns the app currently being served by DevTools local mode, if any.
 */
export function useLocalModeApp(): LocalModeApp | null {
	const [localModeApp, setLocalModeApp] = useState<LocalModeApp | null>(null);

	useEffect(() => {
		let cancelled = false;

		getPageSessionStorage(PAGE_STORAGE_KEY_DEVTOOLS_APPLICATION).then(
			(stored) => {
				if (cancelled) return;
				if (!stored) {
					setLocalModeApp(null);
					return;
				}
				try {
					const data = JSON.parse(stored) as StoredApplicationServerData;
					if (data.connected === true && data.appId && data.type) {
						setLocalModeApp({
							appId: data.appId,
							type: data.type,
							entryIds: getLocalModeEntryIds(
								data.appId,
								readScriptUrls(data).length,
							),
						});
					} else {
						setLocalModeApp(null);
					}
				} catch {
					setLocalModeApp(null);
				}
			},
		);

		return () => {
			cancelled = true;
		};
	}, []);

	return localModeApp;
}
