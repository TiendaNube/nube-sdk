import type { Nullable, Prettify } from "./utility";

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

	/**
	 * Query parameters extracted from the URL.
	 *
	 * Each key represents the name of a query parameter, and its corresponding
	 * value represents the value of that query parameter.
	 */
	queries: Record<string, string>;
};

/**
 * Represents application-wide configuration settings.
 */
export type AppConfig = {
	/** Determines whether cart validation is enabled. */
	has_cart_validation: boolean;
	/** Determines whether the user can select a shipping option. */
	disable_shipping_more_options: boolean;
};
/**
 * Represents a shipping option available in checkout.
 */
export type ShippingOption = {
	/** Unique identifier for the shipping option. */
	id: string;
	original_name: Nullable<string>;
	name: Nullable<string>;
	code: Nullable<string>;
	reference: Nullable<string>;
	type: Nullable<string>;
	price: number;
	price_merchant: number;
	/** Currency of the shipping cost. */
	currency: string;
	/** Estimated minimum delivery date. */
	min_delivery_date: Nullable<string>;
	/** Estimated maximum delivery date. */
	max_delivery_date: Nullable<string>;
	/** Indicates whether a phone number is required for shipping. */
	phone_required: boolean;
	/** Indicates whether an ID is required for shipping. */
	id_required: boolean;
	accepts_cod: boolean;
	/** Indicates eligibility for free shipping. */
	free_shipping_eligible: boolean;
	/** Extra shipping details. */
	extra: {
		show_time: boolean;
		warning: {
			enable: boolean;
		};
		assigned_location_id: Nullable<string>;
		free_shipping: Nullable<number>;
		free_shipping_min_value: Nullable<string>;
		free_shipping_price_merchant: Nullable<number>;
		free_shipping_methods: Nullable<string[]>;
		free_shipping_combines_with_other_discounts: boolean;
	};
	method: Nullable<string>;
	app_id: Nullable<string>;
	hidden: boolean;
	priority: Nullable<number>;
	shippable: boolean;
	shipping_internal_option_code: Nullable<string>;
	sign_key: Nullable<string>;
	smart_date: {
		translate_old_string: Nullable<string>;
		translate_string: Nullable<string>;
		total_old_time: Nullable<string>;
		total_exact_time: Nullable<string>;
		final_time: Nullable<string>;
		show_time: boolean;
		days: Nullable<string>;
		from_week_day: Nullable<string>;
		from_date: Nullable<string>;
		to_week_day: Nullable<string>;
		to_date: Nullable<string>;
		from: Nullable<number>;
		to: Nullable<number>;
		min_days: Nullable<number>;
		max_days: Nullable<number>;
		extra_days: unknown;
	};
};

/**
 * Represents shipping information in checkout.
 */
export type Shipping = {
	/** Selected shipping option ID. */
	selected: Nullable<string>;
	/** List of available shipping options. */
	options: ShippingOption[];
	/** Custom labels assigned to shipping options. */
	custom_labels: Record<string, string>;
};

/**
 * Represents a address in checkout.
 */
export type Address = {
	zipcode: string;
	first_name: Nullable<string>;
	last_name: Nullable<string>;
	address: Nullable<string>;
	number: Nullable<string>;
	floor: Nullable<string>;
	locality: Nullable<string>;
	city: Nullable<string>;
	state: Nullable<string>;
	country: Nullable<string>;
	phone: Nullable<string>;
};

/**
 * Represents a shipping address in checkout.
 * This type extends the Address type with additional properties.
 */
export type ShippingAddress = Prettify<
	Address & {
		between_street: Nullable<string>;
		reference: Nullable<string>;
	}
>;

/**
 * Represents a billing address in checkout.
 * This type extends the Address type with additional properties.
 */
export type BillingAddress = Prettify<
	Address & {
		id_number: Nullable<string>;
		customer_type: Nullable<string>;
		business_name: Nullable<string>;
		trade_name: Nullable<string>;
		state_registration: Nullable<string>;
		fiscal_regime: Nullable<string>;
		invoice_use: Nullable<string>;
		document_type: Nullable<string>;
		business_activity: Nullable<string>;
	}
>;

/**
 * Represents a customer in the checkout process.
 */
export type Customer = {
	contact: {
		email: Nullable<string>;
		name: Nullable<string>;
		phone: Nullable<string>;
		accepts_marketing: Nullable<boolean>;
		accepts_marketing_updated_at: Nullable<string>;
	};
	shipping_address: ShippingAddress;
	billing_address: BillingAddress;
};
