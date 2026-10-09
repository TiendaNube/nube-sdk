import type { JsonObject, NubeComponent } from "./components";
import type {
	AsyncNubeStorage,
	NubeNavigateRoute,
	NubeScrollToEventData,
} from "./storage";

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
	 * Navigates to the given route or alias.
	 * @param route A route starting with '/', or an alias such as `"checkout"`
	 *   or `"login"` that the SDK resolves to the right URL for the store.
	 */
	navigate: (route: NubeNavigateRoute) => void;

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
	 * Returns the `File` currently selected in a `Form.Field` with
	 * `inputType: "file"`, so the app can read it, validate it, build a
	 * local preview or upload it straight from the browser (e.g. a `PUT` to
	 * a pre-signed S3/R2 URL) instead of relying on the `Form.Root` submit.
	 *
	 * The `File` is structured-cloned into the worker, which shares the
	 * underlying bytes instead of copying them. `formRoot.onChange` keeps
	 * reporting only the file name.
	 *
	 * Resolves to `null` when nothing is selected, when the form has no
	 * file field with that `name`, or when the form is not owned by the
	 * calling app (ownership is validated the same way as `submitForm`).
	 *
	 * @example
	 * ```typescript
	 * const file = await browser.getFormFile(form, "document");
	 * if (file) {
	 *   await fetch(presignedUrl, {
	 *     method: "PUT",
	 *     headers: { "Content-Type": file.type },
	 *     body: file,
	 *   });
	 * }
	 * ```
	 * @param form The `Form.Root` component that contains the field.
	 * @param fieldName The `name` prop of the file `Form.Field`.
	 */
	getFormFile: (form: NubeComponent, fieldName: string) => Promise<File | null>;

	/**
	 * Scrolls the page to the given position.
	 * @param options Scroll options compatible with the native ScrollToOptions interface.
	 *   - top: Vertical scroll position in pixels.
	 *   - left: Horizontal scroll position in pixels.
	 *   - behavior: Scroll animation ("smooth", "auto", or "instant"). Defaults to "auto".
	 */
	scrollTo: (options?: NubeScrollToEventData) => void;
};
