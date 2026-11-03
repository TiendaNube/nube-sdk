import {
	AUTO_RELOAD_CHANGE_EVENT,
	readAutoReloadEnabled,
	writeAutoReloadEnabled,
} from "@/utils/local-mode";
import { useCallback, useEffect, useState } from "react";

/** The auto-reload preference, kept in sync across the panel's components. */
export function useLocalModeAutoReloadSetting(): [
	boolean,
	(enabled: boolean) => void,
] {
	const [enabled, setEnabled] = useState(readAutoReloadEnabled);

	useEffect(() => {
		const onChange = () => setEnabled(readAutoReloadEnabled());
		window.addEventListener(AUTO_RELOAD_CHANGE_EVENT, onChange);
		return () => window.removeEventListener(AUTO_RELOAD_CHANGE_EVENT, onChange);
	}, []);

	const update = useCallback((next: boolean) => {
		writeAutoReloadEnabled(next);
	}, []);

	return [enabled, update];
}
