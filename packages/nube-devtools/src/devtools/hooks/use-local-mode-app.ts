import { type LocalModeType, readLocalModeData } from "@/utils/local-mode";
import { useEffect, useState } from "react";

export type LocalModeApp = {
	appId: string;
	type: LocalModeType;
	/** The local bundle the page loads for this app. */
	script: string;
};

/**
 * Returns the app currently being served by DevTools local mode, if any.
 *
 * Read once per mount: starting or stopping Local Mode reloads the page, and
 * the panel is reloaded with every new document.
 */
export function useLocalModeApp(): LocalModeApp | null {
	const [localModeApp, setLocalModeApp] = useState<LocalModeApp | null>(null);

	useEffect(() => {
		let cancelled = false;

		readLocalModeData().then((data) => {
			if (cancelled) return;
			if (data?.connected === true && data.appId && data.type && data.script) {
				setLocalModeApp({
					appId: data.appId,
					type: data.type,
					script: data.script,
				});
			} else {
				setLocalModeApp(null);
			}
		});

		return () => {
			cancelled = true;
		};
	}, []);

	return localModeApp;
}
