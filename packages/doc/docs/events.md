# Events

The communication between the main page and the apps is handled through events, ensuring a reactive and flexible integration where each component operates independently without direct calls.

- **Events Dispatched by the Store:**  
  When significant changes occur—such as an update to the shopping cart—the store dispatches events (e.g., `cart:update`) to notify scripts that a change has occurred.

- **Events Dispatched by the Apps:**  
  Conversely, the apps can emit events (like `cart:validate`) to report on the validity of the cart contents or to signal that additional actions might be required.

This event-driven approach allows the application to respond in real-time to state changes, simplifying maintenance and enhancing scalability.

## `config:set`

Dispatched by `app` to setup initial configuration

```typescript
nube.send("config:set", () => ({
  config: {
    has_cart_validation: true
  },
}));
```

### AppConfig

| Config Type                     | Type    | What for?                                                |
| ------------------------------- | ------- | -------------------------------------------------------- |
| `has_cart_validation`           | boolean | Enables cart validation feature                          |
| `disable_shipping_more_options` | boolean | Determines whether the user can select a shipping option |

## `cart:update`

Dispatched by `store` when the cart content changes

```typescript
nube.on("cart:update", ({ cart }) => {
  if (cart.items.length > 5) {
    console.log("Purchased more than 5 different items");
  }
});
```

## `cart:validate`

Dispatched by `app` to signal if the content of the cart is valid or not. Requires `has_cart_validation: true` in the script configuration to work, otherwise cart validation events are ignored.

```typescript title="Example"
// Tell NubeSDK that this script wants to validate the content of the cart
nube.send("config:set", () => ({
  config: {
    has_cart_validation: true
  },
}));

nube.on("cart:update", ({ cart }) => {
  // Reject the cart if it has fewer than 5 items
  if (cart.items.length < 5) {
    // Dispatch a failed `cart:validate` event with the reason why it failed to validate
    nube.send("cart:validate", () => ({
      cart: {
        validation: {
          status: "fail",
          reason: "Cart must have at least 5 items!",
        },
      },
    }));
    return;
  }
  // Dispatch a successful `cart:validate` event
  nube.send("cart:validate", () => ({
    cart: { validation: { status: "success" } },
  }));
});
```

## `shipping:update`

Dispatched by `store` when the shipping method changes.

```typescript
nube.on("shipping:update", ({ shipping }) => {
  if (shipping?.selected) {
    console.log(
      `Shipping method selected has changed to: ${shipping?.selected}`
    );
  }
});
```

## `customer:update`

Dispatched by `store` when the customer data changes.

```typescript
nube.on("customer:update", ({ customer }) => {
  console.log(`Customer name has changed to: ${customer?.contact?.name}`);
});
```

## `payment:update`

Dispatched by `store` when the payment method changes.

```typescript
nube.on("payment:update", ({ payment }) => {
  console.log(`payment method has changed to: ${payment?.selected}`);
});
```

## `shipping:update:label`

Dispatched by `app` to change checkout shipping method label.

```typescript
nube.send("shipping:update:label", () => ({
  shipping: {
    custom_labels: {
      "ne-correios-sedex": "My custom label",
    },
  },
}));
```

## `ui:slot:set`

Dispatched by `app` to setup the content of a ui slot.

```tsx
import type { NubeSDK } from "@tiendanube/nube-sdk-types";
import { Row, Text } from "@tiendanube/nube-sdk-jsx";

function MyComponent() {
  return (
    <Row>
      <Text>Hello!</Text>
    </Row>
  );
}

export function App(nube: NubeSDK) {
  nube.send("ui:slot:set", () => ({
    ui: {
      slots: {
        after_line_items: <MyComponent />,
      },
    },
  }));
}
```

It can also be used to remove the content of a slot, by specifying `undefined` as the content.

```typescript title="Example"
nube.send("ui:slot:set", () => ({
  ui: {
    slots: {
      before_line_items: undefined,
    },
  },
}));
```
