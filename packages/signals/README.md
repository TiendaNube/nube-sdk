# `@tiendanube/nube-sdk-signals`

**Reactive state for NubeSDK apps, kept in sync with the page.**

## About

`@tiendanube/nube-sdk-signals` gives NubeSDK apps signals: values that notify
what depends on them when they change. Computed signals derive new values,
effects react to changes, and a signal passed to a component keeps that spot of
the page in sync with its value, without rendering the slot again.

Apps in NubeSDK run **inside isolated web workers**, without direct access to the
DOM. Signals live in the worker; the package shares their values with the
platform, which updates only the elements bound to them.

## Installation

```sh
npm install @tiendanube/nube-sdk-signals @tiendanube/nube-sdk-types
```

> Note: `@tiendanube/nube-sdk-types` is a peer dependency and must be installed alongside this package.

## Usage

Call `useSignals(nube)` once at the start of your `App(nube)` entry point, then
pass signals to components as children:

```tsx
import { computed, signal, useSignals } from "@tiendanube/nube-sdk-signals";
import { Box, Text } from "@tiendanube/nube-sdk-jsx";
import type { NubeSDK } from "@tiendanube/nube-sdk-types";

const items = signal(0);
const label = computed(
  () => (items.value === 1 ? "1 item" : `${items.value} items`),
  [items],
);

export function App(nube: NubeSDK) {
  useSignals(nube);

  nube.render(
    "after_line_items",
    <Box>
      <Text>{label}</Text>
    </Box>,
  );

  nube.on("cart:update", ({ cart }) => {
    items.value = cart.items.length; // only the text changes on the page
  });
}
```

Pass the signal itself (`{label}`), not its value (`{label.value}`): the value
is read once, while the signal stays bound to the page.

Without `useSignals(nube)`, signals still work inside the app and a rendered
signal shows the value it had when rendered, but later changes never reach the
page.

## Public API

- `signal<T>(value)` → `Signal<T>`: a value you can read and assign through `.value`, with `.subscribe(fn)`.
- `computed<T>(fn, deps)` → `Computed<T>`: a read-only signal derived from `deps`, with `.dispose()`.
- `effect(fn, deps)` → `() => void`: runs `fn` now and whenever `deps` change. `fn` may return a cleanup function. The returned function stops the effect.
- `batch(fn)`: applies every write inside `fn` at once, so dependents run a single time.
- `useSignals(nube)`: connects the signals of the app to the platform.

Dependencies are explicit: `computed` and `effect` receive the signals they
read, and throw if the list is empty. Changes are compared with `Object.is`.

### Values

Signal values are shared with the platform, so they should survive
`JSON.stringify`: strings, numbers, booleans, `null`, arrays and plain objects.
Only signals of text values (`string`, `number`, `boolean`, `null`,
`undefined`) can be rendered as children.

## How it works

In the component tree a signal is serialized as a node of its own:

```json
{ "type": "signal", "__internalId": "signal-<appId>-<id>", "initialValue": 0 }
```

The platform renders it as a view bound to the signal, starting from
`initialValue`. Later changes travel on their own channel, keyed by
`__internalId`:

- `internal:signals:sync` (app → platform): new values of signals changed, in
  one message per microtask;
- `internal:signals:update` (platform → app): values the platform sets on the
  signals of the app. They are applied in one batch and not sent back.

## Official Documentation

For more details about NubeSDK and how to build apps, check out our **official documentation**:

🔗 **[NubeSDK Documentation](https://nuvemshop.dev/en-US/apps/nube-sdk/overview)**

## Support

- **Questions?** Use [GitHub Issues](https://github.com/TiendaNube/nube-sdk/issues).
- **Found a bug?** Open an issue with a reproducible example.

---

© [Nuvemshop / Tiendanube](https://nuvemshop.dev), 2026. All rights reserved.
