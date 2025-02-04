import type { Nullable } from "./utility";

/**
 * Represents a product in the cart.
 * This type maintains compatibility with the API response format.
 */
export type Product = {
	/** Unique identifier for the product instance in the cart. */
	id: number;

	/** Name of the product. */
	name: string;

	/** Price of the product in string format (to match API response). */
	price: string;

	/** Quantity of this product in the cart. */
	quantity: number;

	/** Indicates whether the product qualifies for free shipping. */
	free_shipping: boolean;

	/** Unique identifier for the product (not cart-specific). */
	product_id: number;

	/** Unique identifier for the selected product variant. */
	variant_id: number;

	/** URL of the product's thumbnail image. */
	thumbnail: string;

	/** Variant details, usually a combination of selected attributes. */
	variant_values: string;

	/** Nullable SKU (Stock Keeping Unit) for the product variant. */
	sku: Nullable<string>;

	/** Additional properties related to the product (structure unknown). */
	properties: Array<unknown>;

	/** URL of the product's page. */
	url: string;

	/** Indicates whether the product is eligible for Ahora 12 financing. */
	is_ahora_12_eligible: boolean;
};

/**
 * Represents the price breakdown for a cart.
 */
export type Prices = {
	/** Discount applied through a coupon. */
	discount_coupon: number;

	/** Discount applied through a payment gateway. */
	discount_gateway: number;

	/** Discount applied through a store promotion. */
	discount_promotion: number;

	/** Cost of shipping. */
	shipping: number;

	/** Subtotal before discounts and shipping. */
	subtotal: number;

	/** Final total price after all discounts and shipping. */
	total: number;
};

/**
 * Represents a discount coupon applied to the cart.
 */
export type Coupon = {
	/** The coupon code used. */
	code: string;

	/** The type of discount (percentage, fixed, etc.). */
	type: string;

	/** The discount value (format depends on `type`). */
	value: string;
};

/**
 * Represents a successful cart validation.
 */
export type CartValidationSuccess = { status: "success" };

/**
 * Represents a pending cart validation (e.g., async validation in progress).
 */
export type CartValidationPending = { status: "pending" };

/**
 * Represents a failed cart validation, including the reason for failure.
 */
export type CartValidationFail = { status: "fail"; reason: string };

/**
 * Represents the validation status of a cart.
 * This can indicate success, failure (with a reason), or a pending state.
 */
export type CartValidation =
	| CartValidationSuccess
	| CartValidationPending
	| CartValidationFail;

/**
 * Represents the current state of a shopping cart.
 */
export type Cart = {
	/** Unique identifier for the cart session. */
	id: string;

	/** Validation status of the cart. */
	validation: CartValidation;

	/** List of products currently in the cart. */
	items: Product[];

	/** Breakdown of the cart's pricing details. */
	prices: Prices;

	/** Optional coupon applied to the cart. */
	coupon: Nullable<Coupon>;
};

/**
 * Represents information about the current store.
 */
export type Store = {
	/** Unique identifier for the store. */
	id: number;

	/** Name of the store. */
	name: string;

	/** Domain name associated with the store. */
	domain: string;

	/** Currency code used in the store (e.g., "USD", "EUR"). */
	currency: string;

	/** Language code of the store (e.g., "en", "es"). */
	language: string;
};

/**
 * Represents a product category.
 */
export type Category = { id: string; name: string };

/**
 * Represents the different steps in the checkout process.
 */
export type Checkout = { step: "start" | "payment" | "success" };

/**
 * Represents a product page.
 */
export type ProductPage = { type: "product"; data: Product };

/**
 * Represents a category page.
 */
export type CategoryPage = { type: "category"; data: Category };

/**
 * Represents a checkout page.
 */
export type CheckoutPage = { type: "checkout"; data: Checkout };

/**
 * Represents a page within the application.
 */
export type Page = CheckoutPage | ProductPage | CategoryPage;

/**
 * Represents the user's current location within the application.
 */
export type AppLocation = {
	/** The current URL of the application. */
	url: string;

	/** The current page type and its associated data. */
	page: Page;
};

/**
 * Represents application-wide configuration settings.
 */
export type AppConfig = {
	/** Determines whether cart validation is enabled. */
	has_cart_validation: boolean;
};
