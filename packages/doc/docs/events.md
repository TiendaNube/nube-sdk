# Events

The communication between the main page and the scripts is handled through events, ensuring a reactive and flexible integration where each component operates independently without direct calls.

- **Events Dispatched by the Main Page:**  
  When significant changes occur—such as an update to the shopping cart—the main page dispatches events (e.g., `cart_updated`) to notify scripts that a change has occurred.

- **Events Dispatched by the Scripts:**  
  Conversely, the scripts can emit events (like `cart:validate`) to report on the validity of the cart contents or to signal that additional actions might be required.

This event-driven approach allows the application to respond in real-time to state changes, simplifying maintenance and enhancing scalability.

## `config:set`

Dispatched by `script` to setup initial script configuration

```typescript title="Example"
nube.send("config:set", () => {
  config: {
    has_cart_validation: true
  },
});
```

### AppConfig

| Config Type                     | Type    | What for?                                                |
| ------------------------------- | ------- | -------------------------------------------------------- |
| `has_cart_validation`           | boolean | Enables cart validation feature                          |
| `disable_shipping_more_options` | boolean | Determines whether the user can select a shipping option |

## `cart:update`

Dispatched by `checkout` when the cart content changes

```typescript title="Example"
nube.on("cart:update", ({ cart }) => {
  if (cart.items > 5) {
    console.log("Purchased more than 5 different items");
  }
});
```

## `cart:validate`

Dispatched by `script` to signal if the content of the cart is valid or not. Requires `has_cart_validation: true` in the script configuration to work, otherwise cart validation events are ignored.

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
  } else {
    // Dispatch a successful `cart:validate` event
    nube.send("cart:validate", () => ({
      cart: {
        validation: {
          status: "success",
        },
      },
    }));
  }
}
```

## `shipping:update`

Dispatched by `checkout` when the shipping method changes.

```typescript title="Example"
nube.on("shipping:update", ({ shipping }) => {
  if (shipping?.selected) {
    console.log(
      `Shipping method selected has changed to: ${shipping?.selected}`
    );
  }
});
```

## `customer:update`

Dispatched by `checkout` when the customer data changes.

```typescript title="Example"
nube.on("customer:update", ({ customer }) => {
  console.log(`Customer name has changed to: ${customer?.contact?.name}`);
});
```

## `payment:update`

Dispatched by `checkout` when the payment method changes.

```typescript title="Example"
nube.on("payment:update", ({ payment }) => {
  console.log(`payment method has changed to: ${payment?.selected}`);
});
```

## `shipping:update:label`

Dispatched by `script` to change checkout shipping method label.

```typescript title="Example"
nube.send("shipping:update:label", () => ({
  shipping: {
    selected: null,
    custom_labels: {
      "ne-correios-sedex": "My custom label",
    },
    options: [],
  },
}));
```

## `ui:slot:set`

Dispatched by `script` to setup the content of a ui slot.

```typescript title="Example"
import type { NubeSDK } from "@tiendanube/nube-sdk-types";
import { Row, Txt } from "@tiendanube/nube-sdk-jsx";

function MyComponent() {
  return (
    <Row>
      <Txt>Hello!</Txt>
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
