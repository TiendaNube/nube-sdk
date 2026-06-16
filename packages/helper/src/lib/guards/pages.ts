/**
 * @fileoverview Page type guards for NubeSDK.
 *
 * Runtime checks that narrow a `Page` to its specific page type.
 */

import type {
	AllProductsPage,
	CategoryPage,
	CheckoutPage,
	HomePage,
	Page,
	ProductPage,
	SearchPage,
} from "@tiendanube/nube-sdk-types";

/**
 * Type guard to check if a page is a product page
 *
 * @param page - The page to check
 * @returns True if the page is a ProductPage
 *
 * @example
 * ```typescript
 * if (isProductPage(page)) {
 *   // page is now typed as ProductPage
 *   console.log(page.data.name);
 *   console.log(page.data.variants);
 * }
 * ```
 *
 * @since 0.1.0
 */
export function isProductPage(page: Page): page is ProductPage {
	return page.type === "product";
}

/**
 * Type guard to check if a page is a category page
 *
 * @param page - The page to check
 * @returns True if the page is a CategoryPage
 *
 * @example
 * ```typescript
 * if (isCategoryPage(page)) {
 *   // page is now typed as CategoryPage
 *   console.log(page.data.name);
 *   console.log(page.data.id);
 * }
 * ```
 *
 * @since 0.1.0
 */
export function isCategoryPage(page: Page): page is CategoryPage {
	return page.type === "category";
}

/**
 * Type guard to check if a page is a checkout page
 *
 * @param page - The page to check
 * @returns True if the page is a CheckoutPage
 *
 * @example
 * ```typescript
 * if (isCheckoutPage(page)) {
 *   // page is now typed as CheckoutPage
 *   console.log(page.data.step);
 * }
 * ```
 *
 * @since 0.1.0
 */
export function isCheckoutPage(page: Page): page is CheckoutPage {
	return page.type === "checkout";
}

/**
 * Type guard to check if a page is an all products page
 *
 * @param page - The page to check
 * @returns True if the page is an AllProductsPage
 *
 * @example
 * ```typescript
 * if (isAllProductsPage(page)) {
 *   // page is now typed as AllProductsPage
 *   console.log(page.data.id); // 0
 *   console.log(page.data.products);
 * }
 * ```
 *
 * @since 0.1.0
 */
export function isAllProductsPage(page: Page): page is AllProductsPage {
	return page.type === "products";
}

/**
 * Type guard to check if a page is a search page
 *
 * @param page - The page to check
 * @returns True if the page is a SearchPage
 *
 * @example
 * ```typescript
 * if (isSearchPage(page)) {
 *   // page is now typed as SearchPage
 *   console.log(page.data.q);
 *   console.log(page.data.products);
 * }
 * ```
 *
 * @since 0.1.0
 */
export function isSearchPage(page: Page): page is SearchPage {
	return page.type === "search";
}

/**
 * Type guard to check if a page is a home page
 *
 * @param page - The page to check
 * @returns True if the page is a HomePage
 *
 * @example
 * ```typescript
 * if (isHomePage(page)) {
 *   // page is now typed as HomePage
 *   console.log(page.data?.sections);
 * }
 * ```
 *
 * @since 0.1.0
 */
export function isHomePage(page: Page): page is HomePage {
	return page.type === "home";
}
