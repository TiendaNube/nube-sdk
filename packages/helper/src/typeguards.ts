/**
 * @fileoverview Type guard utilities for NubeSDK
 * 
 * This module provides comprehensive type guard functions to safely check and narrow
 * types at runtime, ensuring type safety throughout the NubeSDK application.
 * 
 * Type guards are functions that perform runtime checks to determine if a value
 * matches a specific type, allowing TypeScript to narrow the type within the
 * guarded scope. This is essential for working with dynamic data from APIs,
 * user input, and external sources.
 * 
 * @example
 * ```typescript
 * import { isProductPage, isDefined, isNonEmptyString } from '@tiendanube/nube-sdk-helper';
 * 
 * // Type narrowing with page types
 * if (isProductPage(page)) {
 *   // page is now typed as ProductPage
 *   console.log(page.data.name);
 * }
 * 
 * // Safe array filtering
 * const validItems = items.filter(isDefined);
 * 
 * // String validation
 * if (isNonEmptyString(userInput)) {
 *   // userInput is guaranteed to be a non-empty string
 *   processInput(userInput);
 * }
 * ```
 * 
 * @since 0.1.0
 */

import type { 
	CategoryPage, 
	Page, 
	ProductPage, 
	CheckoutPage,
	Cart,
	CartItem,
	CartValidation,
	CartValidationSuccess,
	CartValidationPending,
	CartValidationFail,
	Store,
	Customer,
	Payment,
	Shipping,
	ShippingOption,
	Address,
	ShippingAddress,
	BillingAddress,
	PaymentStatus,
	SelectedPayment,
	AppConfig,
	AppLocation,
	Checkout,
	Category,
	ProductDetails,
	ProductVariant,
	ProductImage,
	Prices,
	Coupon,
	LanguageKey,
	LocalizedString,
	NubeComponent,
	NubeComponentBox,
	NubeComponentColumn,
	NubeComponentRow,
	NubeComponentField,
	NubeComponentNumberField,
	NubeComponentButton,
	NubeComponentSelect,
	NubeComponentCheckbox,
	NubeComponentTextarea,
	NubeComponentImage,
	NubeComponentText,
	NubeComponentIcon,
	NubeComponentAccordionRoot,
	NubeComponentAccordionItem,
	NubeComponentAccordionContent,
	NubeComponentAccordionHeader,
	NubeComponentToastRoot,
	NubeComponentToastTitle,
	NubeComponentToastDescription,
	NubeComponentFragment,
	UISlot,
	CommonUISlot,
	CheckoutUISlot,
	StorefrontUISlot,
	Nullable,
	DeepPartial
} from "@tiendanube/nube-sdk-types";

/**
 * Type guard to check if a value is any kind of object (including arrays, dates, etc.)
 * Excludes null and primitive values
 * 
 * This function performs a basic object check by verifying that the value has
 * a typeof "object" and is not null. This includes arrays, dates, regular objects,
 * and other object types, but excludes primitives and null.
 * 
 * @param value - The value to check
 * @returns True if the value is an object (not null or primitive)
 * 
 * @example
 * ```typescript
 * isObject({}); // true
 * isObject([]); // true
 * isObject(new Date()); // true
 * isObject(null); // false
 * isObject('string'); // false
 * isObject(123); // false
 * 
 * // Usage in type narrowing
 * if (isObject(data)) {
 *   // data is now typed as object
 *   console.log(Object.keys(data));
 * }
 * ```
 * 
 * @since 0.1.0
 */
export function isObject(value: unknown): value is object {
	return typeof value === "object" && value !== null;
}

/**
 * Type guard to check if a value is a plain object (not array, date, or other built-in objects)
 * 
 * This function performs a more strict object check than `isObject` by ensuring
 * the value is not only an object, but specifically a plain object created with
 * object literal syntax or `new Object()`. It excludes arrays, dates, and other
 * built-in object types.
 * 
 * @param value - The value to check
 * @returns True if the value is a plain object
 * 
 * @example
 * ```typescript
 * isPlainObject({}); // true
 * isPlainObject({ key: 'value' }); // true
 * isPlainObject([]); // false
 * isPlainObject(new Date()); // false
 * isPlainObject(null); // false
 * isPlainObject('string'); // false
 * 
 * // Usage with API responses
 * if (isPlainObject(response)) {
 *   // response is now typed as Record<string, unknown>
 *   Object.entries(response).forEach(([key, value]) => {
 *     console.log(`${key}: ${value}`);
 *   });
 * }
 * ```
 * 
 * @since 0.1.0
 */
export function isPlainObject(
	value: unknown,
): value is Record<string, unknown> {
	return (
		isObject(value) &&
		!Array.isArray(value) &&
		Object.prototype.toString.call(value) === "[object Object]"
	);
}

/**
 * Type guard to check if a value is a non-empty string
 * 
 * This function checks if a value is a string and contains non-whitespace characters.
 * It trims the string before checking length, so strings with only whitespace
 * are considered empty.
 * 
 * @param value - The value to check
 * @returns True if the value is a non-empty string
 * 
 * @example
 * ```typescript
 * isNonEmptyString('hello'); // true
 * isNonEmptyString('  '); // false (whitespace only)
 * isNonEmptyString(''); // false
 * isNonEmptyString(123); // false
 * isNonEmptyString(null); // false
 * 
 * // Usage with form validation
 * if (isNonEmptyString(userInput)) {
 *   // userInput is guaranteed to be a non-empty string
 *   processUserInput(userInput);
 * }
 * ```
 * 
 * @since 0.1.0
 */
export function isNonEmptyString(value: unknown): value is string {
	return typeof value === "string" && value.trim().length > 0;
}

/**
 * Type guard to check if a value is a valid number (not NaN)
 * 
 * This function verifies that a value is a number and is not NaN.
 * It's useful for validating numeric inputs and API responses.
 * 
 * @param value - The value to check
 * @returns True if the value is a valid number
 * 
 * @example
 * ```typescript
 * isValidNumber(123); // true
 * isValidNumber(0); // true
 * isValidNumber(-45.67); // true
 * isValidNumber(NaN); // false
 * isValidNumber('123'); // false
 * isValidNumber(null); // false
 * 
 * // Usage with numeric calculations
 * if (isValidNumber(price)) {
 *   // price is guaranteed to be a valid number
 *   const total = price * quantity;
 * }
 * ```
 * 
 * @since 0.1.0
 */
export function isValidNumber(value: unknown): value is number {
	return typeof value === "number" && !Number.isNaN(value);
}

/**
 * Type guard to check if a value is defined (not null or undefined)
 * 
 * This function is particularly useful for filtering arrays to remove
 * null and undefined values, ensuring type safety in subsequent operations.
 * 
 * @param value - The value to check
 * @returns True if the value is defined
 * 
 * @example
 * ```typescript
 * isDefined('hello'); // true
 * isDefined(0); // true
 * isDefined(false); // true
 * isDefined(null); // false
 * isDefined(undefined); // false
 * 
 * // Usage with arrays
 * const items = [1, 2, null, 4, undefined, 6];
 * const validItems = items.filter(isDefined); // [1, 2, 4, 6]
 * 
 * // Usage with optional properties
 * if (isDefined(config.optionalSetting)) {
 *   // config.optionalSetting is now typed as the non-nullable type
 *   useSetting(config.optionalSetting);
 * }
 * ```
 * 
 * @since 0.1.0
 */
export function isDefined<T>(value: T | null | undefined): value is T {
	return value !== null && value !== undefined;
}

/* -------------------------------------------------------------------------- */
/*                              Page Type Guards                              */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                            Cart Type Guards                                */
/* -------------------------------------------------------------------------- */

/**
 * Type guard to check if a value is a valid cart object
 * 
 * @param value - The value to check
 * @returns True if the value is a Cart
 * 
 * @example
 * ```typescript
 * if (isCart(data)) {
 *   // data is now typed as Cart
 *   console.log(data.id);
 *   console.log(data.items.length);
 * }
 * ```
 * 
 * @since 0.1.0
 */
export function isCart(value: unknown): value is Cart {
	return (
		isPlainObject(value) &&
		typeof value.id === "string" &&
		isPlainObject(value.validation) &&
		Array.isArray(value.items) &&
		isPlainObject(value.prices) &&
		isPlainObject(value.coupon)
	);
}

/**
 * Type guard to check if a value is a valid cart item
 * 
 * @param value - The value to check
 * @returns True if the value is a CartItem
 * 
 * @example
 * ```typescript
 * if (isCartItem(item)) {
 *   // item is now typed as CartItem
 *   console.log(item.name);
 *   console.log(item.price);
 * }
 * ```
 * 
 * @since 0.1.0
 */
export function isCartItem(value: unknown): value is CartItem {
	return (
		isPlainObject(value) &&
		typeof value.id === "number" &&
		typeof value.name === "string" &&
		typeof value.price === "string" &&
		typeof value.quantity === "number" &&
		typeof value.free_shipping === "boolean" &&
		typeof value.product_id === "number" &&
		typeof value.variant_id === "number" &&
		typeof value.thumbnail === "string" &&
		typeof value.variant_values === "string" &&
		typeof value.url === "string" &&
		typeof value.is_ahora_12_eligible === "boolean"
	);
}

/**
 * Type guard to check if a cart validation is successful
 * 
 * @param validation - The validation to check
 * @returns True if the validation is successful
 * 
 * @example
 * ```typescript
 * if (isCartValidationSuccess(cart.validation)) {
 *   // cart.validation is now typed as CartValidationSuccess
 *   console.log('Cart is valid');
 * }
 * ```
 * 
 * @since 0.1.0
 */
export function isCartValidationSuccess(validation: CartValidation): validation is CartValidationSuccess {
	return validation.status === "success";
}

/**
 * Type guard to check if a cart validation is pending
 * 
 * @param validation - The validation to check
 * @returns True if the validation is pending
 * 
 * @example
 * ```typescript
 * if (isCartValidationPending(cart.validation)) {
 *   // cart.validation is now typed as CartValidationPending
 *   console.log('Cart validation in progress...');
 * }
 * ```
 * 
 * @since 0.1.0
 */
export function isCartValidationPending(validation: CartValidation): validation is CartValidationPending {
	return validation.status === "pending";
}

/**
 * Type guard to check if a cart validation failed
 * 
 * @param validation - The validation to check
 * @returns True if the validation failed
 * 
 * @example
 * ```typescript
 * if (isCartValidationFail(cart.validation)) {
 *   // cart.validation is now typed as CartValidationFail
 *   console.log('Cart validation failed:', cart.validation.reason);
 * }
 * ```
 * 
 * @since 0.1.0
 */
export function isCartValidationFail(validation: CartValidation): validation is CartValidationFail {
	return validation.status === "fail";
}

/* -------------------------------------------------------------------------- */
/*                           Domain Type Guards                               */
/* -------------------------------------------------------------------------- */

/**
 * Type guard to check if a value is a valid store object
 * 
 * @param value - The value to check
 * @returns True if the value is a Store
 * 
 * @example
 * ```typescript
 * if (isStore(data)) {
 *   // data is now typed as Store
 *   console.log(data.name);
 *   console.log(data.currency);
 * }
 * ```
 * 
 * @since 0.1.0
 */
export function isStore(value: unknown): value is Store {
	return (
		isPlainObject(value) &&
		typeof value.id === "number" &&
		typeof value.name === "string" &&
		typeof value.domain === "string" &&
		typeof value.currency === "string" &&
		typeof value.language === "string"
	);
}

/**
 * Type guard to check if a value is a valid customer object
 * 
 * @param value - The value to check
 * @returns True if the value is a Customer
 * 
 * @example
 * ```typescript
 * if (isCustomer(data)) {
 *   // data is now typed as Customer
 *   console.log(data.contact.email);
 *   console.log(data.shipping_address.city);
 * }
 * ```
 * 
 * @since 0.1.0
 */
export function isCustomer(value: unknown): value is Customer {
	return (
		isPlainObject(value) &&
		(value.id === null || typeof value.id === "number") &&
		isPlainObject(value.contact) &&
		isPlainObject(value.shipping_address) &&
		isPlainObject(value.billing_address)
	);
}

/**
 * Type guard to check if a value is a valid payment object
 * 
 * @param value - The value to check
 * @returns True if the value is a Payment
 * 
 * @example
 * ```typescript
 * if (isPayment(data)) {
 *   // data is now typed as Payment
 *   console.log(data.status);
 *   console.log(data.selected?.method_name);
 * }
 * ```
 * 
 * @since 0.1.0
 */
export function isPayment(value: unknown): value is Payment {
	return (
		isPlainObject(value) &&
		(value.status === null || typeof value.status === "string") &&
		(value.selected === null || isPlainObject(value.selected))
	);
}

/**
 * Type guard to check if a value is a valid shipping object
 * 
 * @param value - The value to check
 * @returns True if the value is a Shipping
 * 
 * @example
 * ```typescript
 * if (isShipping(data)) {
 *   // data is now typed as Shipping
 *   console.log(data.selected);
 *   console.log(data.options?.length);
 * }
 * ```
 * 
 * @since 0.1.0
 */
export function isShipping(value: unknown): value is Shipping {
	return (
		isPlainObject(value) &&
		(value.selected === null || typeof value.selected === "string") &&
		(value.options === undefined || Array.isArray(value.options)) &&
		(value.custom_labels === undefined || isPlainObject(value.custom_labels))
	);
}

/**
 * Type guard to check if a value is a valid shipping option
 * 
 * @param value - The value to check
 * @returns True if the value is a ShippingOption
 * 
 * @example
 * ```typescript
 * if (isShippingOption(option)) {
 *   // option is now typed as ShippingOption
 *   console.log(option.name);
 *   console.log(option.price);
 * }
 * ```
 * 
 * @since 0.1.0
 */
export function isShippingOption(value: unknown): value is ShippingOption {
	return (
		isPlainObject(value) &&
		typeof value.id === "string" &&
		typeof value.price === "number" &&
		typeof value.currency === "string" &&
		typeof value.phone_required === "boolean" &&
		typeof value.id_required === "boolean" &&
		typeof value.accepts_cod === "boolean" &&
		typeof value.free_shipping_eligible === "boolean" &&
		isPlainObject(value.extra) &&
		typeof value.hidden === "boolean" &&
		typeof value.shippable === "boolean"
	);
}

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
		(value.between_street === null || typeof value.between_street === "string") &&
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
		(value.state_registration === null || typeof value.state_registration === "string") &&
		(value.fiscal_regime === null || typeof value.fiscal_regime === "string") &&
		(value.invoice_use === null || typeof value.invoice_use === "string") &&
		(value.document_type === null || typeof value.document_type === "string") &&
		(value.business_activity === null || typeof value.business_activity === "string")
	);
}

/* -------------------------------------------------------------------------- */
/*                          Component Type Guards                             */
/* -------------------------------------------------------------------------- */

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


/* -------------------------------------------------------------------------- */
/*                            Utility Type Guards                             */
/* -------------------------------------------------------------------------- */

/**
 * Type guard to check if a value is nullable (null or undefined)
 * 
 * @param value - The value to check
 * @returns True if the value is null or undefined
 * 
 * @example
 * ```typescript
 * if (isNullable(value)) {
 *   // value is null or undefined
 *   console.log('Value is not available');
 * }
 * ```
 * 
 * @since 0.1.0
 */
export function isNullable<T>(value: T | null | undefined): value is null | undefined {
	return value === null || value === undefined;
}

/**
 * Type guard to check if a value is not nullable
 * 
 * @param value - The value to check
 * @returns True if the value is not null or undefined
 * 
 * @example
 * ```typescript
 * if (isNotNullable(value)) {
 *   // value is guaranteed to be non-null
 *   console.log(value);
 * }
 * ```
 * 
 * @since 0.1.0
 */
export function isNotNullable<T>(value: T | null | undefined): value is T {
	return value !== null && value !== undefined;
}
