# Developer First

Building with NubeSDK is fast, easy, and enjoyable. We designed every aspect of the developer experience so you can focus on creating powerful features without worrying about platform internals.

## CLI to get started quickly

With a single command, you can scaffold a ready-to-run application:

::: code-group

```bash [npm]
npm create nube-app@latest
```

```bash [yarn]
yarn create nube-app
```

```bash [pnpm]
pnpm create nube-app
```

```bash [bun]
bun create nube-app
```

:::

Our CLI offers three templates to suit different types of projects:
- **Minimal**: For apps that only listen and send events.
- **Minimal with UI**: Build interfaces with declarative functions.
- **Minimal with JSX UI**: Use JSX to define interfaces.

---

## Strong typings and modern DX

The [`@tiendanube/nube-sdk-types`](https://www.npmjs.com/package/@tiendanube/nube-sdk-types) package provides complete types for all SDK events, data, and APIs — with autocomplete and inline documentation in your favorite editor.

```ts
import type { NubeSDK } from "@tiendanube/nube-sdk-types";

export function App(nube: NubeSDK) {
  nube.on("checkout:ready", ({ store }) => {
    console.log(`Welcome to store ${store.name}`);
  });
}
```

---

## Build UI with JSX or declarative functions

NubeSDK interfaces are defined as data — you can use JSX (with [`@tiendanube/nube-sdk-jsx`](https://www.npmjs.com/package/@tiendanube/nube-sdk-jsx)) or declarative functions ([`@tiendanube/nube-sdk-ui`](https://www.npmjs.com/package/@tiendanube/nube-sdk-ui)). Both approaches are compatible with the platform renderer.

::: code-group

```tsx [JSX]
import { Box, Text } from "@tiendanube/nube-sdk-jsx";

<Box padding="16px" background="var(--primary-color)">
  <Text>Hello, NubeSDK!</Text>
</Box>;
```

```typescript [Declarative]
import { box, text } from "@tiendanube/nube-sdk-ui";

box({
  padding: "16px",
  background: "var(--primary-color)",
  children: [text({ children: "Hello, NubeSDK!" })],
});
```
:::

These packages are constantly evolving — new components like `button`, `field`, `checkbox`, and `textarea` are frequently added to deliver richer experiences without reinventing the wheel.

---

## Simple event-based communication

All integration with the checkout and store is handled through events. You can listen to user or system actions, and respond with UI updates or validations:

```ts
nube.on("cart:update", ({ cart }) => {
  console.log(`Cart with ${cart.items.length} items`);
});

nube.send("cart:add", () => ({
  cart: {
    items: [{ variant_id: 123, quantity: 2 }],
  },
}));
```

This event-driven model is lightweight, reactive, and scalable — allowing your app to work predictably, even when multiple apps run in parallel.

## Write code you’re proud of

We believe good code goes beyond “it works” — it should be maintainable, testable, and reliable.

That’s why NubeSDK templates come preconfigured with modern tools for static analysis and unit testing:

- [Biome](https://biomejs.dev/) — for linting and formatting with zero config.
- [Vitest](https://vitest.dev/) — for fast unit testing with TypeScript and JSX support.
- Built-in test examples — showing how to validate your app logic from day one.

This setup promotes consistency, catches issues early, and builds confidence as your app grows and evolves.

---

With NubeSDK, you develop using modern tools, strong types, reusable components, and secure platform integration. We built this environment so that **innovation is in your hands — with simplicity and confidence**.
