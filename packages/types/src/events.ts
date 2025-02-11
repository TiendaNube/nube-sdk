import type { ObjectValues, Prettify } from "./utility";

/**
 * Custom events with a specific namespace and identifier.
 */
export type NubeSDKCustomEvent = `custom:${string}:${string}`;

/**
 * List of events that can be sent by the SDK.
 *
 * These events are used to trigger various platform interactions,
 * such as updating UI slots, validating the cart, and modifying configurations.
 *
 * @constant
 *
 * @property {"cart:validate"} CART_VALIDATE - Triggered to validate the current cart state.
 * @property {"config:set"} CONFIG_SET - Used to update the SDK configuration.
 * @property {"ui:slot:set"} UI_SLOT_SET - Updates a UI slot with new content.
 * @property {"shipping:update:label"} SHIPPING_UPDATE_LABEL - Updates custom labels for shipping options.
 */
export const SENDABLE_EVENT = {
	CART_VALIDATE: "cart:validate",
	CONFIG_SET: "config:set",
	UI_SLOT_SET: "ui:slot:set",
	SHIPPING_UPDATE_LABEL: "shipping:update:label",
} as const;

/**
 * Represents the possible events that can be sent within NubeSDK.
 * These events trigger specific actions within the SDK.
 */
export type NubeSDKSendableEvent = Prettify<
	ObjectValues<typeof SENDABLE_EVENT> | NubeSDKCustomEvent
>;

/**
 * List of all available events in the SDK.
 *
 * This object contains both core and sendable events used for handling
 * various lifecycle states and user interactions within the checkout process.
 *
 * @constant
 *
 * @property {"*"} ALL - Wildcard listener for all events.
 * @property {"cart:update"} CART_UPDATE - Fired when the cart state is updated.
 * @property {"checkout:ready"} CHECKOUT_READY - Triggered when checkout is fully initialized.
 * @property {"checkout:success"} CHECKOUT_SUCCESS - Fired upon successful checkout completion.
 * @property {"shipping:update:"} SHIPPING_UPDATE - Fired when a non-custom shipping data change occurs.
 * @property {...typeof SENDABLE_EVENT} - Includes all sendable events.
 */
export const EVENT = {
	ALL: "*",
	CART_UPDATE: "cart:update",
	CHECKOUT_READY: "checkout:ready",
	CHECKOUT_SUCCESS: "checkout:success",
	SHIPPING_UPDATE: "shipping:update:",
	...SENDABLE_EVENT,
} as const;

/**
 * Represents the possible events that can be listened to within NubeSDK.
 * These events notify the application about changes in state or actions.
 */
export type NubeSDKListenableEvent = Prettify<
	ObjectValues<typeof EVENT> | NubeSDKCustomEvent
>;
