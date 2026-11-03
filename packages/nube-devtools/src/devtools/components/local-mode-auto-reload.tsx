import { useLocalModeApp } from "@/devtools/hooks/use-local-mode-app";
import { useLocalModeAutoReloadSetting } from "@/hooks/use-local-mode-auto-reload-setting";
import { reloadInspectedTab } from "@/utils/inspected-tab";
import { fingerprintScript, isValidUrl } from "@/utils/local-mode";
import { useEffect } from "react";
import { toast } from "sonner";

/** How often the local bundle is re-read while Local Mode is connected. */
const CHECK_INTERVAL = 1_500;

/**
 * Reloads the inspected page when the Local Mode bundle changes.
 *
 * Mounted at the panel root rather than in the Local Mode page: the
 * developer who saved a file is looking at Logs or Components, not at the
 * page that started the session, and a watcher living there would stop the
 * moment they navigated away.
 *
 * Renders nothing.
 */
export function LocalModeAutoReload() {
	const app = useLocalModeApp();
	const [enabled] = useLocalModeAutoReloadSetting();
	const script = app?.script ?? null;

	useEffect(() => {
		if (!enabled || !script || !isValidUrl(script)) return;

		let disposed = false;
		let timer: ReturnType<typeof setTimeout> | null = null;
		// The first successful read is the reference; only a later, different
		// one is a change. The page was loaded from that same bundle, so there
		// is nothing to catch up on.
		let baseline: string | null = null;

		const tick = async () => {
			const fingerprint = await fingerprintScript(script);
			if (disposed) return;

			if (fingerprint !== null) {
				if (baseline === null) {
					baseline = fingerprint;
				} else if (fingerprint !== baseline) {
					toast.info("Local app changed, reloading the page...");
					// The reload starts a new document, which reloads this panel
					// too, so there is no next tick to schedule.
					await reloadInspectedTab();
					return;
				}
			}

			timer = setTimeout(tick, CHECK_INTERVAL);
		};

		tick();

		return () => {
			disposed = true;
			if (timer) clearTimeout(timer);
		};
	}, [enabled, script]);

	return null;
}
