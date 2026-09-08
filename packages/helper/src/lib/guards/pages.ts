/**
 * @fileoverview Page type guards for NubeSDK.
 *
 * Runtime checks that narrow a `Page` to its specific page type.
 */

import type {
	AccountInfoPage,
	AccountLoginPage,
	AccountNewPasswordPage,
	AccountOrdersPage,
	AccountPage,
	AccountRegisterPage,
	AccountResetPage,
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

/**
 * Type guard to check if a page is any of the account pages
 *
 * @param page - The page to check
 * @returns True if the page is an AccountPage
 *
 * @example
 * ```typescript
 * if (isAccountPage(page)) {
 *   // page is now typed as AccountPage
 *   console.log(page.data.loggedIn);
 *   console.log(page.data.customerId);
 * }
 * ```
 *
 * @since 0.1.0
 */
export function isAccountPage(page: Page): page is AccountPage {
	return page.type.startsWith("account.");
}

/**
 * Type guard to check if a page is an account login page
 *
 * @param page - The page to check
 * @returns True if the page is an AccountLoginPage
 *
 * @example
 * ```typescript
 * if (isAccountLoginPage(page)) {
 *   // page is now typed as AccountLoginPage
 *   console.log(page.data.loggedIn);
 * }
 * ```
 *
 * @since 0.2.0
 */
export function isAccountLoginPage(page: Page): page is AccountLoginPage {
	return page.type === "account.login";
}

/**
 * Type guard to check if a page is an account registration page
 *
 * @param page - The page to check
 * @returns True if the page is an AccountRegisterPage
 *
 * @example
 * ```typescript
 * if (isAccountRegisterPage(page)) {
 *   // page is now typed as AccountRegisterPage
 *   console.log(page.data.loggedIn);
 * }
 * ```
 *
 * @since 0.2.0
 */
export function isAccountRegisterPage(page: Page): page is AccountRegisterPage {
	return page.type === "account.register";
}

/**
 * Type guard to check if a page is an account information page
 *
 * @param page - The page to check
 * @returns True if the page is an AccountInfoPage
 *
 * @example
 * ```typescript
 * if (isAccountInfoPage(page)) {
 *   // page is now typed as AccountInfoPage
 *   console.log(page.data.customerId);
 * }
 * ```
 *
 * @since 0.2.0
 */
export function isAccountInfoPage(page: Page): page is AccountInfoPage {
	return page.type === "account.info";
}

/**
 * Type guard to check if a page is an account password reset page
 *
 * @param page - The page to check
 * @returns True if the page is an AccountResetPage
 *
 * @example
 * ```typescript
 * if (isAccountResetPage(page)) {
 *   // page is now typed as AccountResetPage
 *   console.log(page.data.loggedIn);
 * }
 * ```
 *
 * @since 0.2.0
 */
export function isAccountResetPage(page: Page): page is AccountResetPage {
	return page.type === "account.reset";
}

/**
 * Type guard to check if a page is an account new password page
 *
 * @param page - The page to check
 * @returns True if the page is an AccountNewPasswordPage
 *
 * @example
 * ```typescript
 * if (isAccountNewPasswordPage(page)) {
 *   // page is now typed as AccountNewPasswordPage
 *   console.log(page.data.loggedIn);
 * }
 * ```
 *
 * @since 0.2.0
 */
export function isAccountNewPasswordPage(
	page: Page,
): page is AccountNewPasswordPage {
	return page.type === "account.newpass";
}

/**
 * Type guard to check if a page is an account orders page
 *
 * @param page - The page to check
 * @returns True if the page is an AccountOrdersPage
 *
 * @example
 * ```typescript
 * if (isAccountOrdersPage(page)) {
 *   // page is now typed as AccountOrdersPage
 *   console.log(page.data.customerId);
 * }
 * ```
 *
 * @since 0.2.0
 */
export function isAccountOrdersPage(page: Page): page is AccountOrdersPage {
	return page.type === "account.orders";
}
