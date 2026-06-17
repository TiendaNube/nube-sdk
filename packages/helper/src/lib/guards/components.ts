/**
 * @fileoverview Component & page-data structure guards for NubeSDK.
 */

import type { NubeComponent, ProductDetails } from "@tiendanube/nube-sdk-types";
import { isObject, isPlainObject } from "../../internal/primitives";

/**
 * Type guard to check if a value is a valid Nube component
 *
 * @param value - The value to check
 * @returns True if the value is a NubeComponent
 *
 * @example
 * ```typescript
 * if (isNubeComponent(component)) {
 *   // component is now typed as NubeComponent
 *   console.log(component.type);
 * }
 * ```
 *
 * @since 0.1.0
 */
export function isNubeComponent(value: unknown): value is NubeComponent {
	return (
		typeof value === "string" ||
		(isPlainObject(value) && typeof value.type === "string")
	);
}

/**
 * Type guard that checks if an object contains a list of products.
 *
 * This function verifies that the provided data is an object with a `products`
 * property that is an array of ProductDetails. Useful for validating page data
 * structures that may contain product lists.
 *
 * @param data - The unknown value to check
 * @returns True if data is an object with a `products` array property, false otherwise
 *
 * @example
 * ```typescript
 * const pageData = { products: [product1, product2] };
 * if (hasProductList(pageData)) {
 *   // TypeScript now knows pageData.products exists and is ProductDetails[]
 *   pageData.products.forEach(product => console.log(product.id));
 * }
 * ```
 */
export function hasProductList(
	data: unknown,
): data is { products: ProductDetails[] } {
	return isObject(data) && "products" in data && Array.isArray(data.products);
}

/**
 * Type guard that checks if an object contains a list of sections.
 *
 * This function verifies that the provided data is an object with a `sections`
 * property that is an array. Useful for validating page data structures that
 * may contain section-based content.
 *
 * @param data - The unknown value to check
 * @returns True if data is an object with a `sections` array property, false otherwise
 *
 * @example
 * ```typescript
 * const pageData = { sections: [{ type: "featured_products", products: [] }] };
 * if (hasSections(pageData)) {
 *   // TypeScript now knows pageData.sections exists and is an array
 *   pageData.sections.forEach(section => processSection(section));
 * }
 * ```
 */
export function hasSections(data: unknown): data is { sections: unknown[] } {
	return isObject(data) && "sections" in data && Array.isArray(data.sections);
}

/**
 * Type guard that checks if a section item contains products.
 *
 * This function verifies that the provided item is an object with a `products`
 * property that is an array of ProductDetails. Useful for iterating through
 * sections and filtering those that contain product lists.
 *
 * @param item - The unknown value to check (typically a section object)
 * @returns True if item is an object with a `products` array property, false otherwise
 *
 * @example
 * ```typescript
 * const sections = [{ type: "featured_products", products: [product1] }];
 * sections.forEach(section => {
 *   if (isSectionWithProducts(section)) {
 *     // TypeScript now knows section.products exists and is ProductDetails[]
 *     section.products.forEach(product => renderProduct(product));
 *   }
 * });
 * ```
 */
export function isSectionWithProducts(
	item: unknown,
): item is { products: ProductDetails[] } {
	return isObject(item) && "products" in item && Array.isArray(item.products);
}

/**
 * Type guard that checks if an object contains a single product (Product Detail Page).
 *
 * This function verifies that the provided data is an object with a `product`
 * property that is a valid ProductDetails object. It performs a minimal integrity
 * check by verifying the product has an `id` property. Useful for validating
 * product detail page data structures.
 *
 * @param data - The unknown value to check
 * @returns True if data is an object with a `product` property containing a valid ProductDetails, false otherwise
 *
 * @example
 * ```typescript
 * const pageData = { product: { id: 1, name: {...}, ... } };
 * if (hasSingleProduct(pageData)) {
 *   // TypeScript now knows pageData.product exists and is ProductDetails
 *   console.log(pageData.product.id);
 * }
 * ```
 */
export function hasSingleProduct(
	data: unknown,
): data is { product: ProductDetails } {
	return (
		isObject(data) &&
		"product" in data &&
		isObject(data.product) &&
		"id" in data.product
	);
}
