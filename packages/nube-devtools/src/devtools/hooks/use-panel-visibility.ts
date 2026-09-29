import { useEffect, useState } from "react";

export const PANEL_VISIBILITY_EVENT = "nube-devtools-panel-visibility";

/**
 * Whether the user is currently looking at this panel.
 *
 * Two signals, because neither covers the other:
 *
 * - The flag published by `src/devtools/bootstrap.ts` from the panel's
 *   `onShown`/`onHidden`, which is the only way to know the user switched to
 *   another DevTools tab. A panel is hidden by hiding its iframe, and an
 *   iframe's `document.hidden` reflects the top-level page rather than its own
 *   display, so the Page Visibility API stays silent through that.
 * - `document.hidden`, which does cover the whole DevTools window being
 *   minimized or its browser tab going to the background — cases `onHidden`
 *   says nothing about.
 */
function readVisibility(): boolean {
	if (typeof document !== "undefined" && document.hidden) return false;

	// Unset means `onShown` has not fired yet. For a document that is running
	// this code, being shown is the safe assumption: treating it as hidden
	// would stall whatever depends on it until the user switched panels twice.
	return window.__NUBE_DEVTOOLS_PANEL_VISIBLE__ !== false;
}

export function usePanelVisibility(): boolean {
	const [isVisible, setIsVisible] = useState(readVisibility);

	useEffect(() => {
		const onChange = () => setIsVisible(readVisibility());

		window.addEventListener(PANEL_VISIBILITY_EVENT, onChange);
		document.addEventListener("visibilitychange", onChange);

		// The flag may have been set before this listener existed.
		onChange();

		return () => {
			window.removeEventListener(PANEL_VISIBILITY_EVENT, onChange);
			document.removeEventListener("visibilitychange", onChange);
		};
	}, []);

	return isVisible;
}
