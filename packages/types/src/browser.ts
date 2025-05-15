import type { AsyncNubeStorage } from "./storage";

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
};
