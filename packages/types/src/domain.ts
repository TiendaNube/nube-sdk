import type { DeepPartial, Nullable, Prettify } from "./utility";

/**
 * Represents the type of device.
 */
export type DeviceType = "mobile" | "desktop";

/**
 * Represents the orientation of the screen.
 */
export type DeviceScreenOrientation = "portrait" | "landscape";

/**
 * Represents the screen state of the device.
 */
export type DeviceScreen = {
	/** The width of the screen in pixels. */
	width: number;
	/** The height of the screen in pixels. */
	height: number;
	/**
	 * The orientation of the screen.
	 * @example "portrait" | "landscape"
	 */
	orientation: DeviceScreenOrientation;
	/** The pixel ratio of the screen. */
	pixelRatio: number;
};

/**
 * Represents the device state.
 */
export type Device = {
	/**
	 * The screen state of the device.
	 * @example { width: 100, height: 100, orientation: "portrait" }
	 */
	screen: DeviceScreen;
	/**
	 * The type of device.
	 * @example "mobile" | "desktop"
	 */
	type: DeviceType;
};

/**
 * Represents a Cart Item.
 * This type maintains compatibility with the API response format.
 */
export type CartItem = {
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
	properties: Array<unknown> | Record<string, unknown>;

	/** URL of the product's page. */
	url: string;

	/** Indicates whether the product is eligible for Ahora 12 financing. */
	is_ahora_12_eligible: boolean;
};

/**
 * Alias for CartItem.
 * @deprecated Use CartItem instead.
 * This type maintains compatibility with the API response format.
 */
export type Product = CartItem;

/**
 * Represents the supported language keys for localization.
 */
export type LanguageKey = "es" | "pt" | "en";

/**
 * Represents a string that can be localized in multiple languages.
 * Each key corresponds to a language code and the value is the translated string.
 */
export type LocalizedString = {
	[k in LanguageKey]?: string;
};

/**
 * Represents a product image with its metadata.
 */
export type ProductImage = {
	/** Unique identifier for the image. */
	id: number;
	/** Alternative text for the image for accessibility. */
	alt: string;
	/** Height of the image in pixels. */
	height: number;
	/** Source URL of the image. */
	src: string;
	/** Width of the image in pixels. */
	width: number;
};

/**
 * Represents a product variant with all its properties and inventory information.
 */
export type ProductVariant = {
	/** Unique identifier for the variant. */
	id: number;
	/** Target age group for the product variant. */
	age_group: "adult" | "infant" | "kids" | "newborn" | "toddler" | null;
	/** Barcode identifier for the variant. */
	barcode: null | string;
	/** Original price before any discounts. */
	compare_at_price: null | string;
	/** Cost of the product for the merchant. */
	cost: null | number;
	/** Custom data associated with the variant. */
	customData?: {
		/** Color information for the variant. */
		color?: string;
	};
	/** Depth measurement of the product. */
	depth: string;
	/** Target gender for the product variant. */
	gender: "female" | "male" | "unisex" | null;
	/** Height measurement of the product. */
	height: string;
	/** ID of the associated image for this variant. */
	image_id: null | number;
	/** Inventory levels across different locations. */
	inventory_levels: {
		/** Unique identifier for the inventory level. */
		id: number;
		/** Location identifier where the stock is held. */
		location_id: string;
		/** Available stock quantity at this location. */
		stock: null | number;
		/** ID of the variant this inventory refers to. */
		variant_id: number;
	}[];
	/** Manufacturer Part Number. */
	mpn: null | number;
	/** Position of this variant in the product's variant list. */
	position: number;
	/** Selling price of the variant. */
	price: null | string;
	/** ID of the parent product. */
	product_id: number;
	/** Promotional or discounted price. */
	promotional_price: null | string;
	/** Stock Keeping Unit identifier. */
	sku: null | string;
	/** Total available stock for this variant. */
	stock: null | number;
	/** Whether stock management is enabled for this variant. */
	stock_management: boolean;
	/** Localized attribute values for the variant. */
	values: LocalizedString[];
	/** Weight measurement of the product. */
	weight: string;
	/** Width measurement of the product. */
	width: string;
};

/**
 * Represents a detailed product with all its properties and metadata.
 */
export type ProductDetails = {
	/** Localized product attributes (size, color, etc.). */
	attributes: LocalizedString[];
	/** Brand name of the product. */
	brand: null | string;
	/** Canonical URL for SEO purposes. */
	canonical_url: string;
	/** Unique identifier for the product. */
	id: number;
	/** Array of category IDs this product belongs to. */
	categories?: Category["id"][];
	/** Localized product description. */
	description: LocalizedString;
	/** Whether the product qualifies for free shipping. */
	free_shipping?: boolean;
	/** Localized URL-friendly product identifier. */
	handle: LocalizedString;
	/** Array of product images. */
	images: ProductImage[];
	/** Localized product name. */
	name: LocalizedString;
	/** Whether the product is published and visible. */
	published: boolean;
	/** Whether the product requires shipping. */
	requires_shipping: boolean;
	/** Localized SEO meta description. */
	seo_description: LocalizedString;
	/** Localized SEO title. */
	seo_title: LocalizedString;
	/** Comma-separated product tags. */
	tags: string;
	/** Array of available product variants. */
	variants: ProductVariant[];
	/** URL of the product's promotional video. */
	video_url: null | string;
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

	/** List of items currently in the cart. */
	items: CartItem[];

	/** Breakdown of the cart's pricing details. */
	prices: Prices;

	/** Optional coupon applied to the cart. */
	coupon: DeepPartial<Coupon>;
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
	language: LanguageKey;
};

type FixedProductListSectionName =
	| "featured_products"
	| "new_products"
	| "sale_products";
type ProductSpecificProductListSectionName =
	| "alternative_products"
	| "complementary_products"
	| "related_products";

export type SectionablePage =
	| HomePage
	| CategoryPage
	| AllProductsPage
	| ProductPage;

type ProductListSectionName<T extends SectionablePage["type"]> =
	T extends ProductPage["type"]
		? ProductSpecificProductListSectionName
		: FixedProductListSectionName;

type ProductListSection<T extends SectionablePage["type"]> = {
	type: ProductListSectionName<T>;
	products: ProductDetails[];
};

// Other sections will be added on demand
export type Section<T extends SectionablePage["type"]> = ProductListSection<T>;

/**
 * Represents data that may contain a list of sections.
 */
export type WithSections<T extends SectionablePage["type"]> = {
	sections?: Section<T>[];
};

/**
 * Represents data that may contain a list of products.
 */
export type WithProductList = { products?: ProductDetails[] };

/**
 * Represents a product category.
 */
export type Category = { id: number; name: string };

/**
 * Represents search information.
 */
export type Search = { q: string };

/**
 * Represents the different steps in the checkout process.
 */
export type Checkout = { step: "start" | "payment" | "success" };

/**
 * Represents the homepage data.
 */
export type Home = undefined | WithSections<"home">;

/**
 * Represents the product page data.
 */
export type ProductPageData = {
	product: ProductDetails;
} & WithSections<"product">;

/**
 * Represents a product page.
 */
export type ProductPage = { type: "product"; data: ProductPageData };

/**
 * Represents a category page.
 */
export type CategoryPage = {
	type: "category";
	data: Category & WithProductList;
};

const ALL_PRODUCTS_CATEGORY_ID = 0;

/**
 * Represents the root category page.
 */
export type AllProductsPage = {
	type: "products";
	data: Category & { id: typeof ALL_PRODUCTS_CATEGORY_ID } & WithProductList;
};

/**
 * Represents the search results page.
 */
export type SearchPage = { type: "search"; data: Search & WithProductList };

/**
 * Represents a checkout page.
 */
export type CheckoutPage = { type: "checkout"; data: Checkout };

/**
 * Represents the homepage.
 */
export type HomePage = { type: "home"; data: Home };

/**
 * Represents a page within the application.
 */
export type Page =
	| HomePage
	| CheckoutPage
	| ProductPage
	| CategoryPage
	| AllProductsPage
	| SearchPage;

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
	code: Nullable<string | number>;
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
	options?: ShippingOption[];
	/** Custom labels assigned to shipping options. */
	custom_labels?: Record<string, string>;
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
	id: Nullable<number>;
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

/**
 * Represents the payment status information in checkout.
 */
export type PaymentStatus =
	| "pending"
	| "paid"
	| "voided"
	| "open"
	| "abandoned"
	| "authorized"
	| "refunded"
	| "recovered"
	| "partially_paid";

/**
 * Represents the selected payment method in checkout.
 * This type includes various properties related to the payment method.
 */
export type SelectedPayment = {
	id: Nullable<string>;
	app_id: Nullable<number>;
	payment_provider_id: Nullable<string>;
	method_name: Nullable<string>;
	type: Nullable<string>;
	method_type: Nullable<string>;
	bypass_gateway: Nullable<boolean>;
	render_gateway_name: Nullable<boolean>;
	method: Nullable<string>;
	template: Nullable<string>;
	name: Nullable<string>;
	category: Nullable<string>;
	billing_address: Nullable<boolean>;
};

/**
 * Represents the payment information in checkout.
 */
export type Payment = {
	status: Nullable<PaymentStatus>;
	selected: Nullable<SelectedPayment>;
};
