/**
 * @fileoverview Cart type guards for NubeSDK.
 */

import type {
	Cart,
	CartItem,
	CartValidation,
	CartValidationFail,
	CartValidationPending,
	CartValidationSuccess,
} from "@tiendanube/nube-sdk-types";
import { isPlainObject } from "../../internal/primitives";

/**
 * Type guard to check if a value is a valid cart object
 *
 * @param value - The value to check
 * @returns True if the value is a Cart
 *
 * @example
 * ```typescript
 * if (isCart(data)) {
 *   // data is now typed as Cart
 *   console.log(data.id);
 *   console.log(data.items.length);
 * }
 * ```
 *
 * @since 0.1.0
 */
export function isCart(value: unknown): value is Cart {
	return (
		isPlainObject(value) &&
		typeof value.id === "string" &&
		isPlainObject(value.validation) &&
		typeof value.validation.status === "string" &&
		Array.isArray(value.items) &&
		isPlainObject(value.prices) &&
		typeof value.prices.subtotal === "number" &&
		typeof value.prices.total === "number" &&
		isPlainObject(value.coupon)
	);
}

/**
 * Type guard to check if a value is a valid cart item
 *
 * @param value - The value to check
 * @returns True if the value is a CartItem
 *
 * @example
 * ```typescript
 * if (isCartItem(item)) {
 *   // item is now typed as CartItem
 *   console.log(item.name);
 *   console.log(item.price);
 * }
 * ```
 *
 * @since 0.1.0
 */
export function isCartItem(value: unknown): value is CartItem {
	return (
		isPlainObject(value) &&
		typeof value.id === "number" &&
		typeof value.name === "string" &&
		typeof value.price === "string" &&
		typeof value.quantity === "number" &&
		typeof value.free_shipping === "boolean" &&
		typeof value.product_id === "number" &&
		typeof value.variant_id === "number" &&
		typeof value.thumbnail === "string" &&
		typeof value.variant_values === "string" &&
		typeof value.url === "string" &&
		typeof value.is_ahora_12_eligible === "boolean"
	);
}

/**
 * Type guard to check if a cart validation is successful
 *
 * @param validation - The validation to check
 * @returns True if the validation is successful
 *
 * @example
 * ```typescript
 * if (isCartValidationSuccess(cart.validation)) {
 *   // cart.validation is now typed as CartValidationSuccess
 *   console.log('Cart is valid');
 * }
 * ```
 *
 * @since 0.1.0
 */
export function isCartValidationSuccess(
	validation: CartValidation,
): validation is CartValidationSuccess {
	return validation.status === "success";
}

/**
 * Type guard to check if a cart validation is pending
 *
 * @param validation - The validation to check
 * @returns True if the validation is pending
 *
 * @example
 * ```typescript
 * if (isCartValidationPending(cart.validation)) {
 *   // cart.validation is now typed as CartValidationPending
 *   console.log('Cart validation in progress...');
 * }
 * ```
 *
 * @since 0.1.0
 */
export function isCartValidationPending(
	validation: CartValidation,
): validation is CartValidationPending {
	return validation.status === "pending";
}

/**
 * Type guard to check if a cart validation failed
 *
 * @param validation - The validation to check
 * @returns True if the validation failed
 *
 * @example
 * ```typescript
 * if (isCartValidationFail(cart.validation)) {
 *   // cart.validation is now typed as CartValidationFail
 *   console.log('Cart validation failed:', cart.validation.reason);
 * }
 * ```
 *
 * @since 0.1.0
 */
export function isCartValidationFail(
	validation: CartValidation,
): validation is CartValidationFail {
	return validation.status === "fail";
}
