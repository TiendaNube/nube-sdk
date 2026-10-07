import { getPageSessionStorage } from "@/utils";
import { useEffect, useState } from "react";

const PAGE_STORAGE_KEY_DEVTOOLS_APPLICATION =
	"nube-devtools-application-server";

export type LocalModeApp = {
	appId: string;
	type: "new" | "existing";
};

type LocalModeStoredData = {
	appId?: string;
	type?: "new" | "existing";
	connected?: boolean;
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
					const data = JSON.parse(stored) as LocalModeStoredData;
					if (data.connected === true && data.appId && data.type) {
						setLocalModeApp({ appId: data.appId, type: data.type });
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
