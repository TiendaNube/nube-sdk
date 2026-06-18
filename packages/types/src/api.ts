import type { CheckoutCommands } from "./checkout";

/**
 * Host-API namespace exposed on `NubeSDK` as `nube.api`.
 *
 * Groups typed adapters that let an app invoke host-side capabilities
 * across the worker / main thread boundary. Each adapter is materialized
 * lazily on first access and cached for the lifetime of the worker.
 *
 * Future integrations (analytics, marketing, etc.) extend this namespace
 * with additional `get*()` factories.
 */
export type NubeAPI = {
	/**
	 * Returns the checkout adapter. Subsequent calls return the same
	 * instance — identity comparisons (`===`) hold.
	 */
	getCheckout(): CheckoutCommands;
};
