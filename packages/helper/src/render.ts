/**
 * @fileoverview Render helpers for NubeSDK
 *
 * This module provides utilities to extract products from state and
 * iterate over them for rendering (e.g., in grid slots).
 */

import type {
	NubeComponent,
	NubeSDKState,
	ProductDetails,
} from "@tiendanube/nube-sdk-types";
import {
	hasProductList,
	hasSections,
	hasSingleProduct,
	isSectionWithProducts,
} from "./typeguards";

/**
 * Extracts all products from the NubeSDK state, regardless of the page type.
 * Strategy: "Greedy" (Aggressive Collection).
 *
 * This function collects products from multiple sources within the state:
 * - Direct product lists in category, products, and search pages
 * - Products within sections for home, product, category, and products pages
 * - The main product in product detail pages
 *
 * @param state - The current NubeSDK state containing location and page information
 * @returns An array of ProductDetails. Returns an empty array if no products are found
 *          or if the page structure doesn't contain products.
 *
 * @example
 * ```typescript
 * const state = nube.getState();
 * const products = getProductsFromState(state);
 * products.forEach(product => console.log(product.id));
 * ```
 */
export function getProductsFromState(state: NubeSDKState): ProductDetails[] {
	const { page } = state.location;

	if (!page || !("data" in page) || !page.data) {
		return [];
	}

	const products: ProductDetails[] = [];

	if (hasProductList(page.data)) {
		products.push(...page.data.products);
	}

	if (hasSections(page.data)) {
		for (const section of page.data.sections) {
			if (isSectionWithProducts(section)) {
				products.push(...section.products);
			}
		}
	}

	if (hasSingleProduct(page.data)) {
		products.push(page.data.product);
	}

	return products;
}

/**
 * Creates a higher-order function that iterates over products in grid slots.
 *
 * This helper abstracts page type checking, product iteration, and automatic key generation.
 * It extracts products from the state, maps them through a render factory function,
 * filters out null/undefined results, and automatically injects unique keys for each component.
 *
 * @param renderFactory - A function that receives a ProductDetails and returns a NubeComponent,
 *                        null, or undefined. Components returning null/undefined are filtered out.
 * @returns A function that accepts NubeSDKState and returns an array of NubeComponent instances
 *          with automatically generated keys using the product ID.
 *
 * @example
 * ```typescript
 * nube.render(
 *   "product_grid_item_image_bottom_right",
 *   forEachProduct((product) => <MyBadge product={product} />)
 * );
 * ```
 */
export function forEachProduct(
	renderFactory: (product: ProductDetails) => NubeComponent | null | undefined,
) {
	return (state: NubeSDKState): NubeComponent[] => {
		const products = getProductsFromState(state);

		if (!products.length) return [];

		return products.reduce<NubeComponent[]>((acc, product) => {
			const component = renderFactory(product);

			if (component) {
				acc.push(Object.assign({}, component, { key: product.id }));
			}

			return acc;
		}, []);
	};
}
