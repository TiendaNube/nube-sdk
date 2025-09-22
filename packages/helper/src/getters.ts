/**
 * @fileoverview Access functions for NubeSDK instance data
 *
 * This module provides utility functions to easily access
 * the SDK instance, current state and application data.
 */

import type { NubeSDK, NubeSDKState } from "@tiendanube/nube-sdk-types";

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
