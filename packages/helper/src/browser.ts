/**
 * @fileoverview Browser APIs access functions for NubeSDK
 *
 * This module provides utility functions to easily access
 * browser APIs through the NubeSDK instance.
 */

import type { NubeBrowserAPIs } from "@tiendanube/nube-sdk-types";

// Cache for the browser APIs instance
let instance: Readonly<NubeBrowserAPIs> | null = null;

/**
 * Browser APIs available through NubeSDK.
 *
 * Provides access to browser storage, navigation, and other APIs
 * in a convenient and type-safe way.
 *
 * @example
 * ```typescript
 * // Use async localStorage
 * await browser.asyncLocalStorage.setItem('key', 'value');
 * const value = await browser.asyncLocalStorage.getItem('key');
 *
 * // Use async sessionStorage
 * await browser.asyncSessionStorage.setItem('session', 'data');
 *
 * // Navigate to a route
 * browser.navigate('/products/123');
 * ```
 *
 * @since 0.1.0
 */
export const browser = new Proxy({} as Readonly<NubeBrowserAPIs>, {
	get(_, prop: keyof NubeBrowserAPIs) {
		// Lazy load: create instance only when a property is accessed
		if (instance === null) {
			instance = self.__SDK_INSTANCE__.getBrowserAPIs();
		}

		// Return the property from the cached instance
		return instance[prop];
	},
});

/**
 * Navigates to a specific route within the Nube application.
 *
 * @param route - The route to navigate to, must start with '/'
 *
 * @example
 * ```typescript
 * // Navigate to a product page
 * navigate('/products/123');
 *
 * // Navigate to home
 * navigate('/');
 *
 * ```
 *
 * @since 0.1.0
 */
export function navigate(route: `/${string}`): void {
	browser.navigate(route);
}

/**
 * Clears the browser APIs cache.
 *
 * This function is useful for testing or when you need to force
 * a fresh instance of the browser APIs to be created.
 *
 * @example
 * ```typescript
 * // Clear cache before testing
 * clearBrowserCache();
 *
 * // Next access to browser properties will create a new instance
 * await browser.asyncLocalStorage.setItem('key', 'value');
 * ```
 *
 * @since 0.1.0
 */
export function clearBrowserCache(): void {
	instance = null;
}
