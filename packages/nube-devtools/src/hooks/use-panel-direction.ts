import * as React from "react";

export type PanelDirection = "horizontal" | "vertical";

const DIRECTION_STORAGE_KEY = "nube-devtools-panel-direction";
// Below this width a side-by-side split leaves too little room for either panel.
const NARROW_BREAKPOINT = 600;

function getStoredDirection(): PanelDirection | null {
	const stored = localStorage.getItem(DIRECTION_STORAGE_KEY);
	return stored === "horizontal" || stored === "vertical" ? stored : null;
}

function getAutoDirection(): PanelDirection {
	return window.innerWidth < NARROW_BREAKPOINT ? "vertical" : "horizontal";
}

/**
 * Split direction shared by every list/detail page. Until the user picks one,
 * it follows the DevTools width; once picked, it is persisted for all pages.
 *
 * `autoSaveId` keeps panel sizes per direction, reusing `baseAutoSaveId` for
 * horizontal so sizes saved before this option existed are preserved.
 */
export function usePanelDirection(baseAutoSaveId: string) {
	const [storedDirection, setStoredDirection] =
		React.useState<PanelDirection | null>(getStoredDirection);
	const [autoDirection, setAutoDirection] =
		React.useState<PanelDirection>(getAutoDirection);

	React.useEffect(() => {
		if (storedDirection) return;
		const mql = window.matchMedia(`(max-width: ${NARROW_BREAKPOINT - 1}px)`);
		const onChange = () => setAutoDirection(getAutoDirection());
		mql.addEventListener("change", onChange);
		return () => mql.removeEventListener("change", onChange);
	}, [storedDirection]);

	const direction = storedDirection ?? autoDirection;

	const toggleDirection = React.useCallback(() => {
		const next: PanelDirection =
			direction === "horizontal" ? "vertical" : "horizontal";
		localStorage.setItem(DIRECTION_STORAGE_KEY, next);
		setStoredDirection(next);
	}, [direction]);

	const autoSaveId =
		direction === "horizontal" ? baseAutoSaveId : `${baseAutoSaveId}-vertical`;

	return { direction, toggleDirection, autoSaveId };
}
