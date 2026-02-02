/**
 * @fileoverview Page matching system for NubeSDK
 *
 * This module provides a type-safe system for handling different page types
 * (product, category, checkout) and their respective data.
 * Includes functions for page matching and event handlers.
 */

import type {
	Category,
	Checkout,
	Home,
	NubeSDKState,
	ProductDetails,
} from "@tiendanube/nube-sdk-types";
import {
	isCategoryPage,
	isCheckoutPage,
	isHomePage,
	isProductPage,
} from "./typeguards";

/**
 * Maps each page type to its specific data payload.
 *
 * @example
 * ```typescript
 * // Product page data
 * const productData: PageDataMap['product'] = {
 *   id: '123',
 *   name: 'Example Product',
 *   price: 29.99
 * };
 *
 * // Category page data
 * const categoryData: PageDataMap['category'] = {
 *   id: 'cat-1',
 *   name: 'Example Category',
 *   products: []
 * };
 * ```
 *
 * @since 0.1.0
 */
export type PageDataMap = {
	product: ProductDetails;
	category: Category;
	checkout: Checkout;
	home: Home;
};

/**
 * Typed handler for a given page type.
 *
 * @template T - The page type (product, category, checkout)
 * @param state - Current NubeSDK state
 * @param data - Page-specific data for the given page type
 *
 * @example
 * ```typescript
 * const productHandler: PageHandlerFunction<'product'> = (state, data) => {
 *   console.log('Product viewed:', data.name);
 *   trackProductView(data.id);
 * };
 *
 * const checkoutHandler: PageHandlerFunction<'checkout'> = (state, data) => {
 *   if (data.step === 'success') {
 *     trackPurchase(data.orderId);
 *   }
 * };
 * ```
 *
 * @since 0.1.0
 */
export type PageHandlerFunction<T extends keyof PageDataMap> = (
	state: NubeSDKState,
	data: PageDataMap[T],
) => void;

/**
 * Partial set of handlers where only relevant page types need to be implemented.
 *
 * @example
 * ```typescript
 * const handlers: PageHandlers = {
 *   product: (state, data) => trackProductView(data.id),
 *   checkout: (state, data) => {
 *     if (data.step === 'success') trackPurchase();
 *   }
 *   // category handler is optional
 * };
 * ```
 *
 * @since 0.1.0
 */
export type PageHandlers = {
	[K in keyof PageDataMap]?: PageHandlerFunction<K>;
};

/**
 * Dispatches to the appropriate handler based on the current page type.
 * Type inference guarantees that each handler receives the correct payload.
 *
 * @param state - Current NubeSDK state
 * @param handlers - Handlers mapped by page type
 *
 * @example
 * ```typescript
 * const state = getCurrentState();
 *
 * pageMatch(state, {
 *   product: (state, data) => {
 *     console.log('Product:', data.name, 'Price:', data.price);
 *   },
 *   category: (state, data) => {
 *     console.log('Category:', data.name, 'Products:', data.products.length);
 *   },
 *   checkout: (state, data) => {
 *     console.log('Checkout step:', data.step);
 *   }
 * });
 * ```
 *
 * @since 0.1.0
 */
export function pageMatch(state: NubeSDKState, handlers: PageHandlers): void {
	const { page } = state.location;

	if (isProductPage(page)) {
		handlers.product?.(state, page.data.product);
		return;
	}

	if (isCategoryPage(page)) {
		handlers.category?.(state, page.data);
		return;
	}

	if (isCheckoutPage(page)) {
		handlers.checkout?.(state, page.data);
		return;
	}

	if (isHomePage(page)) {
		handlers.home?.(state, page.data);
		return;
	}
}

/**
 * Subscribes to navigation changes and invokes handlers that match the current page.
 *
 * Functional pattern that detects the current page type and calls the
 * corresponding handler whenever navigation updates occur.
 *
 * @param handlers - Handlers mapped by page type
 *
 * @example
 * ```typescript
 * onPage({
 *   product: (state, data) => trackProductView(data.id),
 *   checkout: (state, data) => {
 *     if (data.step === 'success') trackPurchase();
 *   }
 * });
 * ```
 *
 * @since 0.1.0
 */
export function onPage(handlers: PageHandlers): void {
	const nube = self.__SDK_INSTANCE__;

	const currentState = nube.getState();

	pageMatch(currentState, handlers);

	nube.on("location:updated", (state: NubeSDKState) =>
		pageMatch(state, handlers),
	);
}

/**
 * Union of all possible checkout steps.
 *
 * @since 0.1.0
 */
type CheckoutStep = Checkout["step"];

/**
 * Handlers per checkout step (e.g., 'cart', 'payment', 'success').
 * Only the steps you care about need to be provided.
 *
 * @example
 * ```typescript
 * const checkoutHandlers: CheckoutStepHandlers = {
 *   cart: (state) => console.log('Cart step'),
 *   payment: (state) => console.log('Payment step'),
 *   success: (state) => console.log('Success step')
 * };
 * ```
 *
 * @since 0.1.0
 */
export type CheckoutStepHandlers = Partial<
	Record<CheckoutStep, (state: NubeSDKState) => void>
>;

/**
 * Runs a handler when the checkout is ready and the current step matches.
 *
 * Listens to `checkout:ready` and, if the current page is a checkout,
 * invokes the handler registered for the current `Checkout.step`.
 *
 * @param handlers - Handlers keyed by checkout step
 *
 * @example
 * ```typescript
 * onCheckoutStep({
 *   cart: (state) => {
 *     console.log('User is in cart step');
 *     trackCartView();
 *   },
 *   success: (state) => {
 *     console.log('Purchase completed');
 *     trackPurchase();
 *   }
 * });
 * ```
 *
 * @since 0.1.0
 */
export function onCheckoutStep(handlers: CheckoutStepHandlers): void {
	const nube = self.__SDK_INSTANCE__;

	const currentState = nube.getState();
	const currentPage = currentState.location.page;

	if (currentPage.type === "checkout") {
		handlers[currentPage?.data?.step]?.(currentState);
	}

	nube.on("checkout:ready", (state: NubeSDKState) => {
		const { page } = state.location;
		if (page.type !== "checkout") return;
		const step: CheckoutStep = page.data.step;
		handlers[step]?.(state);
	});
}
