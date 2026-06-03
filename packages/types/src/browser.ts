import type { JsonObject, NubeComponent } from "./components";
import type { AsyncNubeStorage, NubeScrollToEventData } from "./storage";

/**
 * Represents the main interface for browser APIs that are usually not available in web workers.
 */
export type NubeBrowserAPIs = {
	/**
	 * Provides access to an async version of the local storage API.
	 */
	asyncLocalStorage: AsyncNubeStorage;

	/**
	 * Provides access to an async version of the session storage API.
	 */
	asyncSessionStorage: AsyncNubeStorage;

	/**
	 * Navigates to the given route.
	 * @param route The route to navigate to. Must start with '/'.
	 */
	navigate: (route: `/${string}`) => void;

	/**
	 * Posts a message to the iframe.
	 * @param iframe The iframe component to post the message to.
	 * @param message The message to post to the iframe.
	 */
	postMessageToIframe: (iframe: NubeComponent, message: JsonObject) => void;

	/**
	 * Programmatically submits the given `Form.Root` as if its
	 * `Form.Submitter` had been clicked. Runs the same validation and
	 * fetch pipeline. The app may only submit forms it owns — the
	 * main-thread handler validates ownership via the `__internalId`
	 * prefix and silently ignores cross-app calls.
	 *
	 * Accepts the generic `NubeComponent` so the JSX expression
	 * `<MyForm />` can be passed directly (the JSX runtime erases the
	 * specific return type into `NubeComponent`). The runtime validates
	 * that the resolved DOM element is an `HTMLFormElement`.
	 * @param form The `Form.Root` component to submit.
	 */
	submitForm: (form: NubeComponent) => void;

	/**
	 * Programmatically resets the given `Form.Root`, clearing every
	 * descendant `Form.Field` / `Form.Select` / `Form.Checkbox` back to
	 * its initial state. Ownership is validated the same way as
	 * `submitForm`.
	 * @param form The `Form.Root` component to reset.
	 */
	resetForm: (form: NubeComponent) => void;

	/**
	 * Scrolls the page to the given position.
	 * @param options Scroll options compatible with the native ScrollToOptions interface.
	 *   - top: Vertical scroll position in pixels.
	 *   - left: Horizontal scroll position in pixels.
	 *   - behavior: Scroll animation ("smooth", "auto", or "instant"). Defaults to "auto".
	 */
	scrollTo: (options?: NubeScrollToEventData) => void;
};
