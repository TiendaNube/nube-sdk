/**
 * @fileoverview Address type guards for NubeSDK (address, shipping & billing).
 */

import type {
	Address,
	BillingAddress,
	ShippingAddress,
} from "@tiendanube/nube-sdk-types";
import { isPlainObject } from "../../internal/primitives";

/**
 * Type guard to check if a value is a valid address object
 *
 * @param value - The value to check
 * @returns True if the value is an Address
 *
 * @example
 * ```typescript
 * if (isAddress(data)) {
 *   // data is now typed as Address
 *   console.log(data.zipcode);
 *   console.log(data.city);
 * }
 * ```
 *
 * @since 0.1.0
 */
export function isAddress(value: unknown): value is Address {
	return (
		isPlainObject(value) &&
		typeof value.zipcode === "string" &&
		(value.first_name === null || typeof value.first_name === "string") &&
		(value.last_name === null || typeof value.last_name === "string") &&
		(value.address === null || typeof value.address === "string") &&
		(value.number === null || typeof value.number === "string") &&
		(value.floor === null || typeof value.floor === "string") &&
		(value.locality === null || typeof value.locality === "string") &&
		(value.city === null || typeof value.city === "string") &&
		(value.state === null || typeof value.state === "string") &&
		(value.country === null || typeof value.country === "string") &&
		(value.phone === null || typeof value.phone === "string")
	);
}

/**
 * Type guard to check if a value is a valid shipping address
 *
 * @param value - The value to check
 * @returns True if the value is a ShippingAddress
 *
 * @example
 * ```typescript
 * if (isShippingAddress(data)) {
 *   // data is now typed as ShippingAddress
 *   console.log(data.zipcode);
 *   console.log(data.between_street);
 * }
 * ```
 *
 * @since 0.1.0
 */
export function isShippingAddress(value: unknown): value is ShippingAddress {
	return (
		isPlainObject(value) &&
		typeof value.zipcode === "string" &&
		(value.first_name === null || typeof value.first_name === "string") &&
		(value.last_name === null || typeof value.last_name === "string") &&
		(value.address === null || typeof value.address === "string") &&
		(value.number === null || typeof value.number === "string") &&
		(value.floor === null || typeof value.floor === "string") &&
		(value.locality === null || typeof value.locality === "string") &&
		(value.city === null || typeof value.city === "string") &&
		(value.state === null || typeof value.state === "string") &&
		(value.country === null || typeof value.country === "string") &&
		(value.phone === null || typeof value.phone === "string") &&
		(value.between_street === null ||
			typeof value.between_street === "string") &&
		(value.reference === null || typeof value.reference === "string")
	);
}

/**
 * Type guard to check if a value is a valid billing address
 *
 * @param value - The value to check
 * @returns True if the value is a BillingAddress
 *
 * @example
 * ```typescript
 * if (isBillingAddress(data)) {
 *   // data is now typed as BillingAddress
 *   console.log(data.zipcode);
 *   console.log(data.business_name);
 * }
 * ```
 *
 * @since 0.1.0
 */
export function isBillingAddress(value: unknown): value is BillingAddress {
	return (
		isPlainObject(value) &&
		typeof value.zipcode === "string" &&
		(value.first_name === null || typeof value.first_name === "string") &&
		(value.last_name === null || typeof value.last_name === "string") &&
		(value.address === null || typeof value.address === "string") &&
		(value.number === null || typeof value.number === "string") &&
		(value.floor === null || typeof value.floor === "string") &&
		(value.locality === null || typeof value.locality === "string") &&
		(value.city === null || typeof value.city === "string") &&
		(value.state === null || typeof value.state === "string") &&
		(value.country === null || typeof value.country === "string") &&
		(value.phone === null || typeof value.phone === "string") &&
		(value.id_number === null || typeof value.id_number === "string") &&
		(value.customer_type === null || typeof value.customer_type === "string") &&
		(value.business_name === null || typeof value.business_name === "string") &&
		(value.trade_name === null || typeof value.trade_name === "string") &&
		(value.state_registration === null ||
			typeof value.state_registration === "string") &&
		(value.fiscal_regime === null || typeof value.fiscal_regime === "string") &&
		(value.invoice_use === null || typeof value.invoice_use === "string") &&
		(value.document_type === null || typeof value.document_type === "string") &&
		(value.business_activity === null ||
			typeof value.business_activity === "string")
	);
}
