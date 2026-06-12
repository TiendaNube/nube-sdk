/**
 * @fileoverview NubeSDK instance management
 *
 * The NubeSDK runtime passes the SDK instance only as the argument of the
 * app entry point (`App(nube)`); it does not expose it on a global. This module
 * lets an app register that instance once, so every other helper
 * (`getCurrentState`, `ui`, `browser`, `onPage`, selectors, ...) can access it
 * without threading `nube` through every function and component.
 */

import type { NubeSDK } from "@tiendanube/nube-sdk-types";

/**
 * The instance registered by the app via {@link setNubeInstance}.
 * `undefined` until the app registers one.
 */
let registeredInstance: Readonly<NubeSDK> | undefined;

/**
 * Reads `self.__SDK_INSTANCE__` if it exists, guarding against environments
 * where `self` is undefined (e.g. Node-based test runners).
 */
function readGlobalInstance(): Readonly<NubeSDK> | undefined {
	return typeof self !== "undefined" ? self.__SDK_INSTANCE__ : undefined;
}

/**
 * Registers the NubeSDK instance for the current app.
 *
 * Call this once at the very start of your app entry point so the rest of the
 * helper API can access the instance without it being passed around.
 *
 * @param nube - The NubeSDK instance received by your `App(nube)` entry point
 *
 * @example
 * ```typescript
 * import { setNubeInstance, getCurrentState, ui } from "@tiendanube/nube-sdk-helper";
 *
 * export function App(nube: NubeSDK) {
 *   setNubeInstance(nube);
 *
 *   // No need to pass `nube` around anymore:
 *   const state = getCurrentState();
 *   ui.showToast("App ready!");
 * }
 * ```
 *
 * @since 0.1.0
 */
export function setNubeInstance(nube: Readonly<NubeSDK>): void {
	registeredInstance = nube;
}

/**
 * Gets the NubeSDK instance for the current app.
 *
 * Returns the instance registered via {@link setNubeInstance}. If none was
 * registered, it falls back to `self.__SDK_INSTANCE__` (for forward
 * compatibility) and throws a descriptive error if neither is available.
 *
 * @returns The readonly NubeSDK instance
 * @throws If no instance was registered and no global instance exists
 *
 * @example
 * ```typescript
 * const nube = getNubeInstance();
 * nube.on("location:updated", (state) => {
 *   console.log("Page updated:", state.location.page);
 * });
 * ```
 *
 * @since 0.1.0
 */
export function getNubeInstance(): Readonly<NubeSDK> {
	const instance = registeredInstance ?? readGlobalInstance();

	if (!instance) {
		throw new Error(
			"NubeSDK instance not registered. Call setNubeInstance(nube) at the start of your App(nube) entry point.",
		);
	}

	return instance;
}

/**
 * Clears the registered NubeSDK instance.
 *
 * Mainly useful for testing or for tearing down between app reloads.
 *
 * @since 0.1.0
 */
export function clearNubeInstance(): void {
	registeredInstance = undefined;
}
