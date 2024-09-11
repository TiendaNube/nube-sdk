import type { Nullable } from "./utility";

export type Product = {
	// keep compatibility with api responde
	id: number;
	name: string;
	price: string;
	quantity: number;
	free_shipping: boolean;
	product_id: number;
	variant_id: number;
	thumbnail: string;
	variant_values: string;
	sku: Nullable<string>;
	properties: Array<unknown>;
	url: string;
	is_ahora_12_eligible: boolean;
};

export type Prices = {
	discount_coupon: number;
	discount_gateway: number;
	discount_promotion: number;
	subtotal: number;
	total: number;
};

export type Coupon = {
	code: string;
	type: string;
	value: string;
};

export type CartValidationSuccess = { status: "success" };
export type CartValidationPending = { status: "pending" };
export type CartValidationFail = { status: "fail"; reason: string };

export type CartValidation =
	| CartValidationSuccess
	| CartValidationPending
	| CartValidationFail;

export type Cart = {
	id: string;
	validation: CartValidation;
	items: Product[];
	prices: Prices;
	coupon: Nullable<Coupon>;
};

export type Store = {
	id: number;
	name: string;
	domain: string;
	currency: string;
	language: string;
};

export type Category = { id: string; name: string };
export type Checkout = { step: "start" | "payment" | "success" };

export type ProductPage = { type: "product"; data: Product };
export type CategoryPage = { type: "category"; data: Category };
export type CheckoutPage = { type: "checkout"; data: Checkout };
export type Page = CheckoutPage | ProductPage | CategoryPage;

export type AppLocation = {
	url: string;
	page: Page;
};

export type AppConfig = {
	has_cart_validation: boolean;
};
