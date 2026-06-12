/**
 * @fileoverview State selectors for NubeSDK
 *
 * Small, focused accessors for the most frequently read slices of the SDK
 * state. Each selector accepts an optional `state`; when omitted it reads the
 * current state from the registered instance, so apps don't need to repeat
 * `const state = nube.getState()` everywhere.
 */

import type {
	Cart,
	CartItem,
	Customer,
	NubeSDKState,
	Nullable,
	Page,
} from "@tiendanube/nube-sdk-types";
import { getCurrentState } from "./getters";

/**
 * Gets the current cart.
 *
 * @param state - Optional state; defaults to the current SDK state
 * @returns The cart
 *
 * @example
 * ```typescript
 * const cart = getCart();
 * console.log("Items:", cart.items.length);
 * ```
 *
 * @since 0.1.0
 */
export function getCart(state: NubeSDKState = getCurrentState()): Cart {
	return state.cart;
}

/**
 * Gets the items currently in the cart.
 *
 * @param state - Optional state; defaults to the current SDK state
 * @returns The list of cart items
 *
 * @example
 * ```typescript
 * for (const item of getCartItems()) {
 *   console.log(item.name, item.quantity);
 * }
 * ```
 *
 * @since 0.1.0
 */
export function getCartItems(
	state: NubeSDKState = getCurrentState(),
): CartItem[] {
	return state.cart.items;
}

/**
 * Gets the type of the current page (e.g. `"home"`, `"product"`, `"checkout"`).
 *
 * @param state - Optional state; defaults to the current SDK state
 * @returns The current page type
 *
 * @example
 * ```typescript
 * if (getPageType() === "checkout") {
 *   // checkout-specific logic
 * }
 * ```
 *
 * @since 0.1.0
 */
export function getPageType(
	state: NubeSDKState = getCurrentState(),
): Page["type"] {
	return state.location.page.type;
}

/**
 * Gets the current customer, or `null` when not available on the current page.
 *
 * @param state - Optional state; defaults to the current SDK state
 * @returns The customer or `null`
 *
 * @example
 * ```typescript
 * const customer = getCustomer();
 * if (customer) console.log(customer.contact?.email);
 * ```
 *
 * @since 0.1.0
 */
export function getCustomer(
	state: NubeSDKState = getCurrentState(),
): Nullable<Customer> {
	return state.customer;
}
