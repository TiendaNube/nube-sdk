/**
 * @fileoverview Domain type guards for NubeSDK (store, customer, payment, shipping).
 */

import type {
	Customer,
	Payment,
	Shipping,
	ShippingOption,
	Store,
} from "@tiendanube/nube-sdk-types";
import { isPlainObject } from "../../internal/primitives";

/**
 * Type guard to check if a value is a valid store object
 *
 * @param value - The value to check
 * @returns True if the value is a Store
 *
 * @example
 * ```typescript
 * if (isStore(data)) {
 *   // data is now typed as Store
 *   console.log(data.name);
 *   console.log(data.currency);
 * }
 * ```
 *
 * @since 0.1.0
 */
export function isStore(value: unknown): value is Store {
	return (
		isPlainObject(value) &&
		typeof value.id === "number" &&
		typeof value.name === "string" &&
		typeof value.domain === "string" &&
		typeof value.currency === "string" &&
		typeof value.language === "string"
	);
}

/**
 * Type guard to check if a value is a valid customer object
 *
 * @param value - The value to check
 * @returns True if the value is a Customer
 *
 * @example
 * ```typescript
 * if (isCustomer(data)) {
 *   // data is now typed as Customer
 *   console.log(data.contact.email);
 *   console.log(data.shipping_address.city);
 * }
 * ```
 *
 * @since 0.1.0
 */
export function isCustomer(value: unknown): value is Customer {
	return (
		isPlainObject(value) &&
		(value.id === null || typeof value.id === "number") &&
		isPlainObject(value.contact) &&
		isPlainObject(value.shipping_address) &&
		isPlainObject(value.billing_address)
	);
}

/**
 * Type guard to check if a value is a valid payment object
 *
 * @param value - The value to check
 * @returns True if the value is a Payment
 *
 * @example
 * ```typescript
 * if (isPayment(data)) {
 *   // data is now typed as Payment
 *   console.log(data.status);
 *   console.log(data.selected?.method_name);
 * }
 * ```
 *
 * @since 0.1.0
 */
export function isPayment(value: unknown): value is Payment {
	return (
		isPlainObject(value) &&
		(value.status === null || typeof value.status === "string") &&
		(value.selected === null || isPlainObject(value.selected))
	);
}

/**
 * Type guard to check if a value is a valid shipping object
 *
 * @param value - The value to check
 * @returns True if the value is a Shipping
 *
 * @example
 * ```typescript
 * if (isShipping(data)) {
 *   // data is now typed as Shipping
 *   console.log(data.selected);
 *   console.log(data.options?.length);
 * }
 * ```
 *
 * @since 0.1.0
 */
export function isShipping(value: unknown): value is Shipping {
	return (
		isPlainObject(value) &&
		(value.selected === null || typeof value.selected === "string") &&
		(value.options === undefined || Array.isArray(value.options)) &&
		(value.custom_labels === undefined || isPlainObject(value.custom_labels))
	);
}

/**
 * Type guard to check if a value is a valid shipping option
 *
 * @param value - The value to check
 * @returns True if the value is a ShippingOption
 *
 * @example
 * ```typescript
 * if (isShippingOption(option)) {
 *   // option is now typed as ShippingOption
 *   console.log(option.name);
 *   console.log(option.price);
 * }
 * ```
 *
 * @since 0.1.0
 */
export function isShippingOption(value: unknown): value is ShippingOption {
	return (
		isPlainObject(value) &&
		typeof value.id === "string" &&
		typeof value.price === "number" &&
		typeof value.currency === "string" &&
		typeof value.phone_required === "boolean" &&
		typeof value.id_required === "boolean" &&
		typeof value.accepts_cod === "boolean" &&
		typeof value.free_shipping_eligible === "boolean" &&
		isPlainObject(value.extra) &&
		typeof value.hidden === "boolean" &&
		typeof value.shippable === "boolean"
	);
}
