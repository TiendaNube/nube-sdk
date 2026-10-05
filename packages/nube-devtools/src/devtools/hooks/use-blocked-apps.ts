import type { NubeSDKApp } from "@/background/types";
import { getPageSessionStorage, setPageSessionStorage } from "@/utils";
import { useCallback, useEffect, useState } from "react";

const PAGE_STORAGE_KEY_DEVTOOLS_BLOCKED_APPS = "nube-devtools-blocked-apps";

export type BlockedApp = NubeSDKApp;

const parseBlockedApps = (stored: string | null): BlockedApp[] => {
	if (!stored) return [];
	try {
		const data = JSON.parse(stored) as unknown;
		if (!Array.isArray(data)) return [];
		return data.filter(
			(app): app is BlockedApp =>
				typeof app === "object" &&
				app !== null &&
				typeof (app as BlockedApp).id === "string",
		);
	} catch {
		return [];
	}
};

/**
 * Keeps the list of temporarily blocked apps in the page's sessionStorage,
 * so the block survives reloads while the tab is open.
 */
export function useBlockedApps(): {
	blockedApps: BlockedApp[];
	isBlocked: (appId: string) => boolean;
	setBlocked: (app: BlockedApp, blocked: boolean) => void;
} {
	const [blockedApps, setBlockedApps] = useState<BlockedApp[]>([]);

	useEffect(() => {
		let cancelled = false;

		getPageSessionStorage(PAGE_STORAGE_KEY_DEVTOOLS_BLOCKED_APPS).then(
			(stored) => {
				if (cancelled) return;
				setBlockedApps(parseBlockedApps(stored));
			},
		);

		return () => {
			cancelled = true;
		};
	}, []);

	const setBlocked = useCallback(
		(app: BlockedApp, blocked: boolean) => {
			const next = blocked
				? blockedApps.some((blockedApp) => blockedApp.id === app.id)
					? blockedApps
					: [...blockedApps, app]
				: blockedApps.filter((blockedApp) => blockedApp.id !== app.id);

			if (next === blockedApps) return;

			setBlockedApps(next);
			// Reload only after the page storage is written, so the inspected page
			// starts up already aware of the blocked apps.
			setPageSessionStorage(
				PAGE_STORAGE_KEY_DEVTOOLS_BLOCKED_APPS,
				JSON.stringify(next),
			).then(() => {
				chrome.devtools.inspectedWindow.reload();
			});
		},
		[blockedApps],
	);

	const isBlocked = useCallback(
		(appId: string) => blockedApps.some((app) => app.id === appId),
		[blockedApps],
	);

	return { blockedApps, isBlocked, setBlocked };
}
