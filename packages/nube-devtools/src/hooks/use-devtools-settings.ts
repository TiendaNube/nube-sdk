import {
	DEFAULT_SETTINGS,
	type DevToolsSettings,
	SAVE_SETTINGS_ACTION,
	SETTINGS_STORAGE_KEY,
	loadSettings,
	normalizeSettings,
} from "@/utils/settings";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * The DevTools settings, kept in sync with storage. `settings` is null until
 * they are loaded. `update` resolves once the service worker has applied the
 * change, so a page reload right after it already uses the new rules.
 */
export function useDevToolsSettings() {
	const [settings, setSettings] = useState<DevToolsSettings | null>(null);
	const current = useRef<DevToolsSettings | null>(null);
	current.current = settings;

	useEffect(() => {
		let active = true;
		loadSettings().then((loaded) => {
			if (active) setSettings(loaded);
		});

		// Another panel may change them too.
		const onChanged = (
			changes: Record<string, chrome.storage.StorageChange>,
			area: string,
		) => {
			if (area === "local" && SETTINGS_STORAGE_KEY in changes) {
				setSettings(normalizeSettings(changes[SETTINGS_STORAGE_KEY].newValue));
			}
		};
		chrome.storage.onChanged.addListener(onChanged);

		return () => {
			active = false;
			chrome.storage.onChanged.removeListener(onChanged);
		};
	}, []);

	const update = useCallback(async (changes: Partial<DevToolsSettings>) => {
		const next = { ...(current.current ?? DEFAULT_SETTINGS), ...changes };
		const response = (await chrome.runtime.sendMessage({
			action: SAVE_SETTINGS_ACTION,
			payload: next,
		})) as { settings?: DevToolsSettings; error?: string } | undefined;

		if (!response?.settings) {
			throw new Error(response?.error ?? "Could not save the settings");
		}
		setSettings(response.settings);
		return response.settings;
	}, []);

	return { settings, update };
}
