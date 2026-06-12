/**
 * @fileoverview Access functions for NubeSDK instance data
 *
 * This module provides utility functions to easily access
 * the SDK instance, current state and application data.
 */

import type {
	NubeSDK,
	NubeSDKState,
	Nullable,
} from "@tiendanube/nube-sdk-types";

/**
 * Gets the main NubeSDK instance.
 *
 * @returns The readonly NubeSDK instance
 *
 * @example
 * ```typescript
 * const nube = getNubeInstance();
 * nube.on('location:updated', (state) => {
 *   console.log('Page updated:', state.location.page);
 * });
 * ```
 *
 * @since 0.1.0
 */
export function getNubeInstance(): Readonly<NubeSDK> {
	return self.__SDK_INSTANCE__;
}

/**
 * Gets the current NubeSDK state.
 *
 * @returns The current readonly SDK state
 *
 * @example
 * ```typescript
 * const state = getCurrentState();
 * console.log('Current page:', state.location.page.type);
 * console.log('Page data:', state.location.page.data);
 * ```
 *
 * @since 0.1.0
 */
export function getCurrentState(): Readonly<NubeSDKState> {
	return self.__SDK_INSTANCE__.getState();
}

/**
 * Gets the current application data.
 *
 * @returns Readonly object containing application ID and script
 *
 * @example
 * ```typescript
 * const appData = getAppData();
 * console.log('Application ID:', appData.id);
 * console.log('Application script:', appData.script);
 * ```
 *
 * @since 0.1.0
 */
export function getAppData(): Readonly<{
	id: string;
	script: string;
}> {
	return self.__APP_DATA__;
}

let cachedScriptURL: Readonly<URL> | undefined;

/**
 * Gets the parsed URL of the application script.
 *
 * @returns The readonly URL instance of the application script
 *
 * @example
 * ```typescript
 * const url = getScriptURL();
 * console.log('Script origin:', url.origin);
 * console.log('Script pathname:', url.pathname);
 * ```
 *
 * @since 0.1.0
 */
export function getScriptURL(): Readonly<URL> {
	if (!cachedScriptURL) {
		cachedScriptURL = Object.freeze(new URL(self.__APP_DATA__.script));
	}
	return cachedScriptURL;
}

/**
 * Gets the search parameters of the application script URL.
 *
 * @returns The readonly URLSearchParams instance from the script URL
 *
 * @example
 * ```typescript
 * const params = getScriptSearchParams();
 * for (const [key, value] of params) {
 *   console.log(`${key}: ${value}`);
 * }
 * ```
 *
 * @since 0.1.0
 */
export function getScriptSearchParams(): Readonly<URLSearchParams> {
	return getScriptURL().searchParams;
}

/**
 * Gets a specific search parameter from the application script URL.
 *
 * @param key - The name of the search parameter to retrieve
 * @returns The value of the search parameter, or null if not present
 *
 * @example
 * ```typescript
 * const version = getScriptParam('version');
 * if (version) {
 *   console.log('Script version:', version);
 * }
 * ```
 *
 * @since 0.1.0
 */
export function getScriptParam(key: string): Nullable<string> {
	return getScriptSearchParams().get(key);
}
