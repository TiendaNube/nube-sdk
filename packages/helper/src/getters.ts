/**
 * @fileoverview Access functions for NubeSDK instance data
 * 
 * This module provides utility functions to easily access
 * the SDK instance, current state, application data and browser APIs.
 */

import type { AsyncNubeStorage, NubeSDK, NubeSDKState } from "@tiendanube/nube-sdk-types";
import type { NubeBrowserAPIs } from "@tiendanube/nube-sdk-types/src/browser";

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

/**
 * Gets the browser APIs available through NubeSDK.
 * 
 * @returns The readonly browser APIs
 * 
 * @example
 * ```typescript
 * const browserAPIs = browser();
 * 
 * // Use async localStorage
 * await browserAPIs.asyncLocalStorage.setItem('key', 'value');
 * const value = await browserAPIs.asyncLocalStorage.getItem('key');
 * 
 * // Use async sessionStorage
 * await browserAPIs.asyncSessionStorage.setItem('session', 'data');
 * ```
 * 
 * @since 0.1.0
 */
export function browser(): Readonly<NubeBrowserAPIs> {
	return self.__SDK_INSTANCE__.getBrowserAPIs();
}

/**
 * Gets the async localStorage instance.
 * 
 * @returns The readonly AsyncNubeStorage instance for localStorage
 * 
 * @example
 * ```typescript
 * const storage = getAsyncLocalStorage();
 * 
 * // Save data
 * await storage.setItem('user_preferences', JSON.stringify({ theme: 'dark' }));
 * 
 * // Retrieve data
 * const preferences = await storage.getItem('user_preferences');
 * if (preferences) {
 *   const data = JSON.parse(preferences);
 *   console.log('Theme:', data.theme);
 * }
 * ```
 * 
 * @since 0.1.0
 */
export function getAsyncLocalStorage(): Readonly<AsyncNubeStorage> {
	return browser().asyncLocalStorage;
}

/**
 * Gets the async sessionStorage instance.
 * 
 * @returns The readonly AsyncNubeStorage instance for sessionStorage
 * 
 * @example
 * ```typescript
 * const sessionStorage = getAsyncSessionStorage();
 * 
 * // Save session data
 * await sessionStorage.setItem('temp_data', JSON.stringify({ step: 1 }));
 * 
 * // Retrieve session data
 * const tempData = await sessionStorage.getItem('temp_data');
 * if (tempData) {
 *   const data = JSON.parse(tempData);
 *   console.log('Current step:', data.step);
 * }
 * ```
 * 
 * @since 0.1.0
 */
export function getAsyncSessionStorage(): Readonly<AsyncNubeStorage> {
	return browser().asyncSessionStorage;
}
