# App State

The type `NubeSDKState`, represents the complete state of a NubeSDK app, providing access to all available data and configurations. This state object is passed to various SDK functions, allowing developers to access and react to the current application state.

The type definition could be found in the `@tiendanube/nube-sdk-types` package.

```typescript
import type { NubeSDKState } from "@tiendanube/nube-sdk-types";
```

## How to get state

There are 3 ways to get the `NubeSDKState` in your app:

### 1. The getState function

This function returns the current state of the SDK, ideal for getting information at app startup.

```typescript
import type { NubeSDK, NubeSDKState } from "@tiendanube/nube-sdk-types";

export function App(nube: NubeSDK) {
  // Get current state
  const currentState: Readonly<NubeSDKState> = nube.getState();

  // Access state properties
  const cartTotal = currentState.cart.total;
  const storeCurrency = currentState.store.currency;
  const currentPage = currentState.location.page.type;
}
```

### 2. Listening to State Changes

Whenever an event is triggered, the listener function receives a snapshot of the state at the time of the event.

```typescript
import type { NubeSDK, NubeSDKState } from '@tiendanube/nube-sdk-types';

export function App(nube: NubeSDK) {
  // Listen for state changes
  nube.on('customer:update', (state: Readonly<NubeSDKState>) => {
      const customerEmail = state.customer.email;
      const customerAddress = state.customer.address;
    }
  });
}
```

For more details on how to monitor state updates and subscribe to various state events, please see [Events](./events). This page provides comprehensive examples and explanations on how to listen for updates such as `cart:update`, `shipping:update`, and more, allowing you to build a dynamic, responsive application.

### 3. Modifying State

When an event is sent, a modified function can be defined as the second parameter, this function receives a snapshot of the state and should return a partial version of the state to be merged into the current state.

```tsx
import type { NubeSDK, NubeSDKState } from "@tiendanube/nube-sdk-types";
import { Text } from "@tiendanube/nube-sdk-jsx";

export function App(nube: NubeSDK) {
  // Send events with state modifications
  nube.send("ui:slot:set", (state: Readonly<NubeSDKState>) => {
    // Return a DeepPartial<NubeSDKState>
    const storeName = state.store.name;
    return {
      ui: {
        slots: {
          before_main_content: <Text>{`Hello ${storeName}!`}</Text>,
        },
      },
    };
  });
}
```

## `NubeSDKState`

Below you will find the complete definition of the `NubeSDKState` type.

```typescript
export type NubeSDKState = {
  /**
   * The current cart state, containing products, pricing, and validation status.
   */
  cart: Cart;

  /**
   * Application-wide configuration settings, including cart validation rules.
   */
  config: AppConfig;

  /**
   * The user's current location within the application, including the page type and URL.
   */
  location: AppLocation;

  /**
   * Information about the current store, such as its domain, currency, and language.
   */
  store: Store;

  /**
   * Represents UI-related state, including dynamically injected components and their values.
   */
  ui: UI;

  /**
   * Information about shipping, such as available options, selected option and custom labels.
   * This property may be null depending on the page it is accessed from.
   */
  shipping: Nullable<Shipping>;

  /**
   * Details about the customer, including identification, contact information, and address.
   */
  customer: Nullable<Customer>;

  /**
   * Information about the payment method, including type, status, and selected option.
   */
  payment: Nullable<Payment>;
};
```

## `cart`

The current cart state, containing products, pricing, and validation status.

```typescript
type Cart = {
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

type Product = {
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

type Prices = {
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

type Coupon = {
  /** The coupon code used. */
  code: string;

  /** The type of discount (percentage, fixed, etc.). */
  type: string;

  /** The discount value (format depends on `type`). */
  value: string;
};

/** The card validation state */
type CartValidation =
  | CartValidationSuccess
  | CartValidationPending
  | CartValidationFail;

type CartValidationSuccess = { status: "success" };
type CartValidationPending = { status: "pending" };
type CartValidationFail = { status: "fail"; reason: string };
```

## `config`

Application-wide configuration settings, including cart validation rules.

```typescript
type AppConfig = {
  /** Determines whether cart validation is enabled. */
  has_cart_validation: boolean;

  /** Determines whether the user can select a shipping option. */
  disable_shipping_more_options: boolean;
};
```

## `location`

The user's current location within the application, including the page type and URL.

```typescript
type AppLocation = {
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

// New variations will be broken with the evolution of the NubeSDK
type Page = CheckoutPage;

type CheckoutPage = {
  type: "checkout";
  data: Checkout;
};

type Checkout = {
  step: "start" | "payment" | "success";
};

type Category = {
  id: string;
  name: string;
};
```

## `store`

Information about the current store, such as its domain, currency, and language.

```typescript
type Store = {
  domain: string;
  currency: string;
  language: string;
  settings: StoreSettings;
};
```

## `ui`

Represents UI-related state, including dynamically injected components and their values.

```typescript
type UI = {
  /**
   * Contains dynamically injected components into specific UI slots.
   * Each key represents a slot name and its value is the component to be rendered.
   */
  slots: UISlots;

  /**
   * Stores values associated with specific UI components, typically form inputs.
   * WARNING: These values are managed internally by the SDK components.
   * Modifying them directly may cause unexpected behavior.
   */
  values: UIValues;
};

/**
 * Represents a mapping of UI slots to their respective components.
 */
type UISlots = Partial<Record<UISlot, NubeComponent>>;

/**
 * Represents a mapping of UI component IDs to their respective values.
 */
type UIValues = Record<NubeComponentId, UIValue>;

/**
 * Represents a UI slot where components can be dynamically injected.
 */
type UISlot =
  | "before_main_content" // Before the main checkout content
  | "after_main_content" // After the main checkout content
  | "before_line_items" // Before the list of items in the cart
  | "after_line_items" // After the list of items in the cart
  | "after_contact_form" // After the contact form in checkout
  | "after_address_form" // After the address form in checkout
  | "after_billing_form" // After the billing form in checkout
  | "after_payment_options" // After the payment options in checkout
  | "before_address_form" // Before the address form in checkout
  | "before_billing_form" // Before the billing form in checkout
  | "before_contact_form" // Before the contact form in checkout
  | "modal_content"; // Content of a modal dialog in checkout

/**
 * Represents the value of a UI component, typically used for form inputs.
 */
type UIValue = string;

/**
 * Represents a unique identifier for a UI component.
 */
type NubeComponentId = string;
```

## `shipping`

Information about shipping, such as available options, selected option and custom labels.
This property may be null depending on the page it is accessed from.

```typescript
type Shipping = {
  /** Selected shipping option ID. */
  selected: Nullable<string>;

  /** List of available shipping options. */
  options: ShippingOption[];

  /** Custom labels assigned to shipping options. */
  custom_labels: Record<string, string>;
};

type ShippingOption = {
  /** Unique identifier for the shipping option. */
  id: string;

  /** Original name of the shipping option. */
  original_name: Nullable<string>;

  /** Display name of the shipping option. */
  name: Nullable<string>;

  /** Shipping method code. */
  code: Nullable<string>;

  /** Reference code for the shipping option. */
  reference: Nullable<string>;

  /** Type of shipping method. */
  type: Nullable<string>;

  /** Price of the shipping option. */
  price: number;

  /** Merchant price of the shipping option. */
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

  /** Indicates whether cash on delivery is accepted. */
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

  /** Shipping method identifier. */
  method: Nullable<string>;

  /** Application ID associated with the shipping option. */
  app_id: Nullable<string>;

  /** Indicates whether the shipping option is hidden. */
  hidden: boolean;

  /** Priority of the shipping option. */
  priority: Nullable<number>;

  /** Indicates whether the shipping option is available. */
  shippable: boolean;

  /** Internal shipping option code. */
  shipping_internal_option_code: Nullable<string>;

  /** Sign key for the shipping option. */
  sign_key: Nullable<string>;

  /** Smart date information for delivery estimates. */
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
```

## `customer`

Details about the customer, including identification, contact information, and address.
This property may be null depending on the page it is accessed from.

```typescript
type Customer = {
  /** Customer contact information. */
  contact: {
    /** Customer's email address. */
    email: Nullable<string>;

    /** Customer's full name. */
    name: Nullable<string>;

    /** Customer's phone number. */
    phone: Nullable<string>;

    /** Whether the customer accepts marketing communications. */
    accepts_marketing: Nullable<boolean>;

    /** Timestamp of when marketing preferences were last updated. */
    accepts_marketing_updated_at: Nullable<string>;
  };

  /** Customer's shipping address. */
  shipping_address: ShippingAddress;

  /** Customer's billing address. */
  billing_address: BillingAddress;
};

type Address = {
  /** Postal code of the address. */
  zipcode: string;

  /** First name of the address owner. */
  first_name: Nullable<string>;

  /** Last name of the address owner. */
  last_name: Nullable<string>;

  /** Street address. */
  address: Nullable<string>;

  /** Street number. */
  number: Nullable<string>;

  /** Floor or apartment number. */
  floor: Nullable<string>;

  /** Locality or neighborhood. */
  locality: Nullable<string>;

  /** City name. */
  city: Nullable<string>;

  /** State or province. */
  state: Nullable<string>;

  /** Country name. */
  country: Nullable<string>;

  /** Phone number associated with the address. */
  phone: Nullable<string>;
};

type ShippingAddress = Address & {
  /** Additional address information between streets. */
  between_street: Nullable<string>;

  /** Reference points or additional address information. */
  reference: Nullable<string>;
};

type BillingAddress = Address & {
  /** Tax identification number. */
  id_number: Nullable<string>;

  /** Type of customer (individual or business). */
  customer_type: Nullable<string>;

  /** Legal business name. */
  business_name: Nullable<string>;

  /** Trade name or commercial name. */
  trade_name: Nullable<string>;

  /** State registration number. */
  state_registration: Nullable<string>;

  /** Fiscal regime classification. */
  fiscal_regime: Nullable<string>;

  /** Invoice usage classification. */
  invoice_use: Nullable<string>;

  /** Type of identification document. */
  document_type: Nullable<string>;

  /** Business activity or industry. */
  business_activity: Nullable<string>;
};
```

## `payment`

Information about the payment method, including type, status, and selected option.
This property may be null depending on the page it is accessed from.

```typescript
type Payment = {
  /** The selected payment method. */
  method: string;

  /** The current status of the payment. */
  status: PaymentStatus;

  /** The selected payment option details. */
  selectedOption: Nullable<PaymentOption>;
};

/** Represents the possible payment statuses. */
type PaymentStatus =
  | "pending" // Payment is pending processing
  | "processing" // Payment is being processed
  | "approved" // Payment was approved
  | "rejected" // Payment was rejected
  | "failed" // Payment failed
  | "cancelled"; // Payment was cancelled

/** Represents a payment option with its details. */
type PaymentOption = {
  /** Unique identifier for the payment option. */
  id: string;

  /** Name of the payment option. */
  name: string;

  /** Type of payment option (e.g., credit_card, bank_transfer). */
  type: string;

  /** Additional configuration for the payment option. */
  config: {
    /** Whether the payment option is enabled. */
    enabled: boolean;

    /** Minimum amount allowed for this payment option. */
    min_amount: Nullable<number>;

    /** Maximum amount allowed for this payment option. */
    max_amount: Nullable<number>;

    /** List of supported currencies. */
    currencies: string[];

    /** List of supported countries. */
    countries: string[];

    /** Whether the payment option requires a phone number. */
    requires_phone: boolean;

    /** Whether the payment option requires a document number. */
    requires_document: boolean;

    /** Whether the payment option requires a billing address. */
    requires_billing_address: boolean;
  };

  /** Additional payment option details. */
  details: {
    /** URL of the payment option's logo. */
    logo_url: Nullable<string>;

    /** Description of the payment option. */
    description: Nullable<string>;

    /** Terms and conditions of the payment option. */
    terms_and_conditions: Nullable<string>;

    /** Whether the payment option supports installments. */
    supports_installments: boolean;

    /** Maximum number of installments allowed. */
    max_installments: Nullable<number>;

    /** Minimum installment amount. */
    min_installment_amount: Nullable<number>;

    /** Interest rates for installments. */
    installment_rates: Record<string, number>;
  };
};
```

## Notes

- Properties marked as `Nullable<T>` may be `null` depending on the context or page where they are accessed
- The `UI` property contains dynamically injected components and their values
- The `location` property helps determine the current context of the application
- All monetary values in the `cart` property are in the store's base currency
- The state is immutable and can only be modified through the `send` method of `NubeSDK`
