/// <reference types="vite/client" />
/// <reference types="chrome" />

declare const __APP_VERSION__: string;

/**
 * Whether the DevTools panel is currently shown, published onto the panel
 * document by `src/devtools/bootstrap.ts`. Undefined until the panel's
 * `onShown` has fired at least once.
 */
interface Window {
	__NUBE_DEVTOOLS_PANEL_VISIBLE__?: boolean;
}
