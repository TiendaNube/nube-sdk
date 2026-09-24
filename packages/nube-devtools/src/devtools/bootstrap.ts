const isDev = process.env.NODE_ENV === "development";

/**
 * The panel document, as handed over by `onShown`.
 *
 * `onHidden` does not carry it, so it is kept from the last `onShown` — the
 * panel cannot be hidden without having been shown first.
 */
let panelWindow: (Window & typeof globalThis) | null = null;

/**
 * Publishes the panel's visibility onto the panel document itself.
 *
 * This bridge exists because the two halves live in different documents:
 * `onShown`/`onHidden` are only reachable from the devtools page (this file),
 * while the code that acts on them runs inside `panel.html`. And they are the
 * only reliable signal — DevTools hides a panel by hiding its iframe, and an
 * iframe's `document.hidden` follows the top-level page, not its own display,
 * so `visibilitychange` never fires when the user switches to Elements.
 *
 * The state is written as a property and announced with an event built from
 * the panel's own realm, so nothing has to be read across realms.
 */
function publishVisibility(visible: boolean) {
	if (!panelWindow) return;

	try {
		panelWindow.__NUBE_DEVTOOLS_PANEL_VISIBLE__ = visible;
		panelWindow.dispatchEvent(
			new panelWindow.CustomEvent("nube-devtools-panel-visibility"),
		);
	} catch {
		// The panel document was torn down between the event and this call.
	}
}

chrome.devtools.panels.create(
	`NubeSDK${isDev ? " - DEV" : ""}`,
	"",
	"panel.html",
	(panel) => {
		panel.onShown.addListener((shownWindow) => {
			// Typed as a bare `Window` by @types/chrome, which does not reach
			// the realm's own constructors.
			panelWindow = shownWindow as Window & typeof globalThis;
			publishVisibility(true);
		});

		panel.onHidden.addListener(() => publishVisibility(false));
	},
);
