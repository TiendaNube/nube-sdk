import type { ObjectValues, Prettify } from "./utility";

/**
 * List of common UI slots available across different contexts.
 *
 * These slots are shared between checkout and storefront interfaces,
 * providing consistent placement options for UI components.
 *
 * @constant
 *
 * @property {"before_main_content"} BEFORE_MAIN_CONTENT - Before the main content area.
 * @property {"after_main_content"} AFTER_MAIN_CONTENT - After the main content area.
 * @property {"modal_content"} MODAL_CONTENT - Content of a modal dialog.
 * @property {"corner_top_left"} CORNER_TOP_LEFT - Top left corner of the page.
 * @property {"corner_top_right"} CORNER_TOP_RIGHT - Top right corner of the page.
 * @property {"corner_bottom_left"} CORNER_BOTTOM_LEFT - Bottom left corner of the page.
 * @property {"corner_bottom_right"} CORNER_BOTTOM_RIGHT - Bottom right corner of the page.
 * @property {"before_line_items"} BEFORE_LINE_ITEMS - Before the list of items in the cart.
 * @property {"after_line_items"} AFTER_LINE_ITEMS - After the list of items in the cart.
 */
export const COMMON_UI_SLOT = {
	BEFORE_MAIN_CONTENT: "before_main_content",
	AFTER_MAIN_CONTENT: "after_main_content",
	MODAL_CONTENT: "modal_content",
	CORNER_TOP_LEFT: "corner_top_left",
	CORNER_TOP_RIGHT: "corner_top_right",
	CORNER_BOTTOM_LEFT: "corner_bottom_left",
	CORNER_BOTTOM_RIGHT: "corner_bottom_right",
	BEFORE_LINE_ITEMS: "before_line_items",
	AFTER_LINE_ITEMS: "after_line_items",
} as const;

/**
 * List of UI slots available in the checkout context.
 *
 * These slots provide specific placement options for UI components
 * during the checkout process, allowing customization of forms,
 * payment options, and item displays.
 *
 * @constant
 *
 * @property {"after_contact_form"} AFTER_CONTACT_FORM - After the contact form in checkout.
 * @property {"after_address_form"} AFTER_ADDRESS_FORM - After the address form in checkout.
 * @property {"after_billing_form"} AFTER_BILLING_FORM - After the billing form in checkout.
 * @property {"after_payment_options"} AFTER_PAYMENT_OPTIONS - After the payment options in checkout.
 * @property {"before_payment_options"} BEFORE_PAYMENT_OPTIONS - Before the payment options in checkout.
 * @property {"before_address_form"} BEFORE_ADDRESS_FORM - Before the address form in checkout.
 * @property {"before_billing_form"} BEFORE_BILLING_FORM - Before the billing form in checkout.
 * @property {"before_contact_form"} BEFORE_CONTACT_FORM - Before the contact form in checkout.
 * @property {"after_line_items_price"} AFTER_LINE_ITEMS_PRICE - After the price of the line items in checkout.
 * @property {"before_shipping_form"} BEFORE_SHIPPING_FORM - Before the shipping form in checkout.
 * @property {"after_shipping_form"} AFTER_SHIPPING_FORM - After the shipping form in checkout.
 * @property {"after_shipping_description"} AFTER_SHIPPING_DESCRIPTION - After the shipping description in checkout.
 * @property {...typeof COMMON_UI_SLOT} - Includes all common UI slots.
 */
export const CHECKOUT_UI_SLOT = {
	...COMMON_UI_SLOT,
	AFTER_CONTACT_FORM: "after_contact_form",
	AFTER_ADDRESS_FORM: "after_address_form",
	AFTER_BILLING_FORM: "after_billing_form",
	AFTER_PAYMENT_OPTIONS: "after_payment_options",
	BEFORE_PAYMENT_OPTIONS: "before_payment_options",
	BEFORE_ADDRESS_FORM: "before_address_form",
	BEFORE_BILLING_FORM: "before_billing_form",
	BEFORE_CONTACT_FORM: "before_contact_form",
	AFTER_LINE_ITEMS_PRICE: "after_line_items_price",
	BEFORE_SHIPPING_FORM: "before_shipping_form",
	AFTER_SHIPPING_FORM: "after_shipping_form",
	AFTER_SHIPPING_DESCRIPTION: "after_shipping_description",
} as const;

/**
 * List of UI slots available in the storefront context.
 *
 * These slots provide specific placement options for UI components
 * in product pages and storefronts, allowing customization of
 * product displays, add to cart buttons, and grid layouts.
 *
 * @constant
 *
 * @property {"before_quick_buy_add_to_cart"} BEFORE_QUICK_BUY_ADD_TO_CART - Before the quick buy add to cart button.
 * @property {"before_product_detail_add_to_cart"} BEFORE_PRODUCT_DETAIL_ADD_TO_CART - Before the product detail add to cart button.
 * @property {"after_product_detail_add_to_cart"} AFTER_PRODUCT_DETAIL_ADD_TO_CART - After the product detail add to cart button.
 * @property {"product_detail_image_top_left"} PRODUCT_DETAIL_IMAGE_TOP_LEFT - Top left corner of product detail images.
 * @property {"product_detail_image_top_right"} PRODUCT_DETAIL_IMAGE_TOP_RIGHT - Top right corner of product detail images.
 * @property {"after_product_detail_name"} AFTER_PRODUCT_DETAIL_NAME - After the product name in product detail.
 * @property {"after_product_grid_item_name"} AFTER_PRODUCT_GRID_ITEM_NAME - After the product name in grid items.
 * @property {"product_grid_item_image_top_right"} PRODUCT_GRID_ITEM_IMAGE_TOP_RIGHT - Top right corner of product grid item images.
 * @property {"product_grid_item_image_top_left"} PRODUCT_GRID_ITEM_IMAGE_TOP_LEFT - Top left corner of product grid item images.
 * @property {"product_grid_item_image_bottom_right"} PRODUCT_GRID_ITEM_IMAGE_BOTTOM_RIGHT - Bottom right corner of product grid item images.
 * @property {"product_grid_item_image_bottom_left"} PRODUCT_GRID_ITEM_IMAGE_BOTTOM_LEFT - Bottom left corner of product grid item images.
 * @property {"before_start_checkout_button"} BEFORE_START_CHECKOUT_BUTTON - Before the start checkout button.
 * @property {...typeof COMMON_UI_SLOT} - Includes all common UI slots.
 */
export const STOREFRONT_UI_SLOT = {
	...COMMON_UI_SLOT,
	BEFORE_QUICK_BUY_ADD_TO_CART: "before_quick_buy_add_to_cart",
	BEFORE_PRODUCT_DETAIL_ADD_TO_CART: "before_product_detail_add_to_cart",
	AFTER_PRODUCT_DETAIL_ADD_TO_CART: "after_product_detail_add_to_cart",
	PRODUCT_DETAIL_IMAGE_TOP_LEFT: "product_detail_image_top_left",
	AFTER_PRODUCT_DETAIL_NAME: "after_product_detail_name",
	PRODUCT_DETAIL_IMAGE_TOP_RIGHT: "product_detail_image_top_right",
	AFTER_PRODUCT_GRID_ITEM_NAME: "after_product_grid_item_name",
	PRODUCT_GRID_ITEM_IMAGE_TOP_RIGHT: "product_grid_item_image_top_right",
	PRODUCT_GRID_ITEM_IMAGE_TOP_LEFT: "product_grid_item_image_top_left",
	PRODUCT_GRID_ITEM_IMAGE_BOTTOM_RIGHT: "product_grid_item_image_bottom_right",
	PRODUCT_GRID_ITEM_IMAGE_BOTTOM_LEFT: "product_grid_item_image_bottom_left",
	BEFORE_START_CHECKOUT_BUTTON: "before_start_checkout_button",
} as const;

/**
 * Combined list of all available UI slots.
 *
 * This object merges all checkout and storefront UI slots,
 * providing a unified interface for accessing any UI slot.
 *
 * @constant
 *
 * @property {...typeof CHECKOUT_UI_SLOT} - Includes all checkout UI slots.
 * @property {...typeof STOREFRONT_UI_SLOT} - Includes all storefront UI slots.
 */
export const UI_SLOT = {
	...CHECKOUT_UI_SLOT,
	...STOREFRONT_UI_SLOT,
} as const;

/**
 * Represents the possible common UI slots that can be used across different contexts.
 * These slots are available in both checkout and storefront interfaces.
 */
export type CommonUISlot = ObjectValues<typeof COMMON_UI_SLOT>;

/**
 * Represents the possible UI slots that can be used in the checkout context.
 * Includes all common slots plus checkout-specific slots.
 */
export type CheckoutUISlot = ObjectValues<typeof CHECKOUT_UI_SLOT>;

/**
 * Represents the possible UI slots that can be used in the storefront context.
 * Includes all common slots plus storefront-specific slots.
 */
export type StorefrontUISlot = ObjectValues<typeof STOREFRONT_UI_SLOT>;

/**
 * Represents all possible UI slots where components can be dynamically injected.
 * This type combines checkout, storefront, and common UI slots.
 */
export type UISlot = Prettify<CheckoutUISlot | StorefrontUISlot>;
