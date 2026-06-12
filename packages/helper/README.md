# @tiendanube/nube-sdk-helper

Utility functions, type guards, and instance management for building NubeSDK apps.

## Installation

```bash
npm install @tiendanube/nube-sdk-helper
```

## Instance management

The NubeSDK runtime passes the SDK instance only as the argument of your app
entry point (`App(nube)`). Register it once with `setNubeInstance` and every
other helper (`getCurrentState`, `ui`, `browser`, selectors, `onPage`, ...) can
access it without you having to thread `nube` through every function and
component.

```typescript
import {
  setNubeInstance,
  getCurrentState,
  getNubeInstance,
  ui,
} from "@tiendanube/nube-sdk-helper";
import type { NubeSDK } from "@tiendanube/nube-sdk-types";

export function App(nube: NubeSDK) {
  setNubeInstance(nube); // call this first

  const state = getCurrentState();
  ui.showToast(`You are on the ${state.location.page.type} page`);
}
```

- `setNubeInstance(nube)` — registers the instance (call once at the top of `App`).
- `getNubeInstance()` — returns the registered instance; throws a descriptive
  error if you forgot to register it.
- `clearNubeInstance()` — clears the registered instance (useful in tests).

## State access

```typescript
import {
  getCurrentState,
  getCart,
  getCartItems,
  getPageType,
  getCustomer,
  getAppData,
  getScriptParam,
} from "@tiendanube/nube-sdk-helper";

// Selectors read the current state by default; pass a state to keep them pure.
const items = getCartItems();
const pageType = getPageType();
const customer = getCustomer();

// App data injected by the runtime
const { id } = getAppData();
const variant = getScriptParam("variant"); // ?variant=... on the app script URL
```

## Pages and checkout

```typescript
import { pageMatch, onPage, onCheckoutStep } from "@tiendanube/nube-sdk-helper";

// One-off dispatch on the current page:
pageMatch(getCurrentState(), {
  product: (state, product) => console.log(product.name),
  checkout: (state, checkout) => console.log(checkout.step),
});

// Subscribe to navigation. Both return an unsubscribe function:
const stop = onPage({
  product: (state, product) => trackProductView(product.id),
});
// stop(); // when you no longer need it

onCheckoutStep({
  success: () => trackPurchase(),
});
```

## Events

```typescript
import { onEvent, toastOn } from "@tiendanube/nube-sdk-helper";

// Thin wrapper around nube.on that returns an unsubscribe:
const off = onEvent("cart:update", (state) => {
  console.log("items:", state.cart.items.length);
});

// Show a toast whenever an event fires:
toastOn("cart:add:success", "Added to cart", "success");
toastOn("cart:update", (state) => `Cart: ${state.cart.items.length} items`);
```

## Rendering

```typescript
import { ui, forEachProduct } from "@tiendanube/nube-sdk-helper";

// Render the same component into many slots at once:
ui.renderAll(["corner_top_left", "corner_top_right"], { type: "txt", children: "Hi" });

// Render one component per product on the current page (keys are added automatically):
getNubeInstance().render(
  "product_grid_item_image_bottom_right",
  forEachProduct((product) => ({ type: "txt", children: product.name })),
);

ui.showToast("Done!", "success");
ui.clear("corner_top_right");
```

## Browser APIs

```typescript
import { browser, navigate } from "@tiendanube/nube-sdk-helper";

await browser.asyncLocalStorage.setItem("key", "value");
navigate("/products/123");
```

## Type guards

Runtime checks that also narrow types for TypeScript:

- Pages: `isProductPage`, `isCategoryPage`, `isCheckoutPage`, `isHomePage`,
  `isAllProductsPage`, `isSearchPage`
- Cart: `isCart`, `isCartItem`, `isCartValidationSuccess` / `Pending` / `Fail`
- Domain: `isStore`, `isCustomer`, `isPayment`, `isShipping`, `isShippingOption`,
  `isAddress`, `isShippingAddress`, `isBillingAddress`
- Components / page data: `isNubeComponent`, `hasProductList`, `hasSections`,
  `hasSingleProduct`, `isSectionWithProducts`

```typescript
import { isProductPage } from "@tiendanube/nube-sdk-helper";

const { page } = getCurrentState().location;
if (isProductPage(page)) {
  console.log(page.data.product.name);
}
```

## General utilities

```typescript
import { deepClone, debounce, throttle } from "@tiendanube/nube-sdk-helper";

const copy = deepClone(state); // uses structuredClone when available
const debounced = debounce((q: string) => search(q), 300);
const throttled = throttle(() => onScroll(), 100);
```

## License

MIT
