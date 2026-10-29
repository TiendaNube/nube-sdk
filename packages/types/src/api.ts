import type { AnalyticsCommands } from "./analytics";
import type { AvailableSlotsCommands } from "./available-slots";
import type { CheckoutCommands } from "./checkout";
import type { CustomizationCommands } from "./customization";
import type { ObserverCommands } from "./observer";
import type { StructuredDataCommands } from "./structured-data";

/**
 * Host-API namespace exposed on `NubeSDK` as `nube.api`.
 *
 * Groups typed adapters that let an app invoke host-side capabilities
 * across the worker / main thread boundary. Each adapter is materialized
 * lazily on first access and cached for the lifetime of the worker.
 *
 * Future integrations extend this namespace
 * with additional `get*()` factories.
 */
export type NubeAPI = {
	/**
	 * Returns the checkout adapter. Subsequent calls return the same
	 * instance — identity comparisons (`===`) hold.
	 */
	getCheckout(): CheckoutCommands;

	/**
	 * Returns the analytics adapter. Subsequent calls return the same
	 * instance — identity comparisons (`===`) hold.
	 */
	getAnalytics(): AnalyticsCommands;

	/**
	 * Returns the available-slots adapter, used to discover the static and
	 * dynamic slots present on the current page. Subsequent calls return the
	 * same instance — identity comparisons (`===`) hold.
	 */
	getAvailableSlots(): AvailableSlotsCommands;

	/**
	 * Returns the customization adapter, used to change native elements of the
	 * store's interface. Subsequent calls return the same instance
	 */
	getCustomization(): CustomizationCommands;

	/**
	 * Returns the observer adapter, used to follow targets on the page —
	 * whether they are there, whether the shopper can see them and where they
	 * are. Subsequent calls return the same instance — identity comparisons
	 * (`===`) hold.
	 */
	getObserver(): ObserverCommands;

	/**
	 * Returns the structured-data adapter, used to contribute properties to
	 * the Schema.org JSON-LD the platform renders on the page. Subsequent
	 * calls return the same instance — identity comparisons (`===`) hold.
	 */
	getStructuredData(): StructuredDataCommands;
};
