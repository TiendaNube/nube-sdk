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
 * @property {"cart:add"} CART_ADD - Used to add a cart item.
 * @property {"cart:remove"} CART_REMOVE - Used to remove a cart item.
 * @property {"config:set"} CONFIG_SET - Used to update the SDK configuration.
 * @property {"ui:slot:set"} UI_SLOT_SET - Used to update a UI slot with new content.
 * @property {"shipping:update:label"} SHIPPING_UPDATE_LABEL - Used to update custom labels for shipping options.
 */
export const SENDABLE_EVENT = {
	CART_VALIDATE: "cart:validate",
	CART_ADD: "cart:add",
	CART_REMOVE: "cart:remove",
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
 * @property {"cart:add:success"} CART_ADD_SUCCESS - Fired when a cart item is added successfully.
 * @property {"cart:add:fail"} CART_ADD_FAIL - Fired when a cart item is added unsuccessfully.
 * @property {"cart:remove:success"} CART_REMOVE_SUCCESS - Fired when a cart item is removed successfully.
 * @property {"cart:remove:fail"} CART_REMOVE_FAIL - Fired when a cart item is removed unsuccessfully.
 * @property {"checkout:ready"} CHECKOUT_READY - Triggered when checkout is fully initialized.
 * @property {"checkout:success"} CHECKOUT_SUCCESS - Fired upon successful checkout completion.
 * @property {"shipping:update"} SHIPPING_UPDATE - Fired when a non-custom shipping data change occurs.
 * @property {"customer:update"} CUSTOMER_UPDATE - Fired when the customer data is updated.
 * @property {"payment:update"} PAYMENT_UPDATE - Fired when the payment data is updated.
 * @property {...typeof SENDABLE_EVENT} - Includes all sendable events.
 */
export const EVENT = {
	ALL: "*",
	CART_UPDATE: "cart:update",
	CART_ADD_SUCCESS: "cart:add:success",
	CART_REMOVE_SUCCESS: "cart:remove:success",
	CART_ADD_FAIL: "cart:add:fail",
	CART_REMOVE_FAIL: "cart:remove:fail",
	CHECKOUT_READY: "checkout:ready",
	CHECKOUT_SUCCESS: "checkout:success",
	SHIPPING_UPDATE: "shipping:update",
	CUSTOMER_UPDATE: "customer:update",
	PAYMENT_UPDATE: "payment:update",
	...SENDABLE_EVENT,
} as const;

/**
 * Represents the possible events that can be listened to within NubeSDK.
 * These events notify the application about changes in state or actions.
 */
export type NubeSDKListenableEvent = Prettify<
	ObjectValues<typeof EVENT> | NubeSDKCustomEvent
>;
