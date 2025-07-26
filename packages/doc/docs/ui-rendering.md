# UI Rendering

The NubeSDK provides powerful methods to dynamically render and manage UI components in checkout slots. This allows you to create dynamic interfaces that can be updated based on the current state of the application.

## Render Method

The `render` method allows you to inject components into specific UI slots. It supports both static components and dynamic components that are computed based on the current state.

### Static Rendering

```ts
import type { NubeSDK } from "@tiendanube/nube-sdk-types";
import { Button, Text } from "@tiendanube/nube-sdk-jsx";

export function App(nube: NubeSDK) {
  // Render a static component
  nube.render("after_line_items", (
    <Button onClick={() => console.log("Clicked!")}>
      Static Button
    </Button>
  ));
}
```

### Dynamic Rendering

You can pass a function that receives the current state and returns a component. This enables dynamic UI that can be computed based on the current state.

```ts
import type { NubeSDK } from "@tiendanube/nube-sdk-types";
import { Button, Text } from "@tiendanube/nube-sdk-jsx";

export function App(nube: NubeSDK) {
  // Render a dynamic component
  nube.render("after_line_items", (state) => {
    const itemCount = state.cart.items.length;

    return (
      <Text>
        You have {itemCount} items in your cart
      </Text>
    );
  });
}
```

### Conditional Rendering

The dynamic approach is perfect for conditional rendering based on the current state.

```ts
import type { NubeSDK } from "@tiendanube/nube-sdk-types";
import { Button, Text } from "@tiendanube/nube-sdk-jsx";

export function App(nube: NubeSDK) {
  nube.render("after_line_items", (state) => {
    // Only show if cart has items
    if (state.cart.items.length === 0) {
      return null; // Nothing will be rendered
    }

    return (
      <Button onClick={() => nube.send("cart:clear")}>
        Clear Cart ({state.cart.items.length} items)
      </Button>
    );
  });
}
```

## ClearSlot Method

The `clearSlot` method removes components from a specific UI slot, effectively cleaning up the rendered content.

```ts
import type { NubeSDK } from "@tiendanube/nube-sdk-types";

export function App(nube: NubeSDK) {
  // Render a component
  nube.render("after_line_items", <Text>Hello World</Text>);

  // Later, remove it
  nube.clearSlot("after_line_items");
}
```

## Best Practices

### 1. Clean Up on Page Changes

Always clear slots when navigating between pages to avoid stale components.

```ts
import type { NubeSDK } from "@tiendanube/nube-sdk-types";

export function App(nube: NubeSDK) {
  nube.on("checkout:ready", ({ location }) => {
    // Clear previous content
    nube.clearSlot("after_line_items");

    // Render new content based on current page
    if (location.page.type === "checkout") {
      nube.render("after_line_items", <Text>Checkout Page</Text>);
    }
  });
}
```

### 2. Use Dynamic Components for State-Based Content

Prefer dynamic components when the UI needs to be computed based on the current state.

```ts
export function App(nube: NubeSDK) {
  // Good: Dynamic component
  nube.render("after_line_items", (state) => (
    <Text>Total: ${state.cart.total}</Text>
  ));

  // Note: You need to manually re-render when state changes
  nube.on("cart:updated", () => {
    nube.clearSlot("after_line_items");
    nube.render("after_line_items", (state) => (
      <Text>Total: ${state.cart.total}</Text>
    ));
  });
}
```

### 3. Handle Component Lifecycle

Consider the lifecycle of your components and clean up when necessary.

```ts
export function App(nube: NubeSDK) {
  let isComponentRendered = false;

  nube.on("checkout:ready", ({ location }) => {
    if (location.page.type === "checkout" && !isComponentRendered) {
      nube.render("after_line_items", <Text>Component</Text>);
      isComponentRendered = true;
    }
  });

  nube.on("checkout:leave", () => {
    if (isComponentRendered) {
      nube.clearSlot("after_line_items");
      isComponentRendered = false;
    }
  });
}
```

## Integration with Events

The rendering methods work seamlessly with the SDK's event system. Note that you need to manually re-render components when the state changes.

```ts
export function App(nube: NubeSDK) {
  // Render a component that responds to events
  nube.render("after_line_items", (state) => (
    <Button
      onClick={() => nube.send("cart:validate", () => ({
        cart: { validation: { status: "success" } }
      }))}
    >
      Validate Cart
    </Button>
  ));

  // You need to manually re-render when state changes
  nube.on("cart:validation:updated", () => {
    nube.clearSlot("after_line_items");
    nube.render("after_line_items", (state) => (
      <Button
        onClick={() => nube.send("cart:validate", () => ({
          cart: { validation: { status: "success" } }
        }))}
      >
        Validate Cart
      </Button>
    ));
  });
}
```

## Available Slots

For a complete list of available UI slots, see the [UI Slots](/docs/ui-slots) documentation.

## Related

- [UI Slots](/docs/ui-slots) - Learn about available slots
- [Components](/docs/components) - Available UI components
- [State Management](/docs/state) - Understanding the SDK state
- [Events](/docs/events) - Working with SDK events
