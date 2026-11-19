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

### Conditional rendering

`Show` and `Match` pick what is rendered from the value of a signal. Every
branch is sent with the tree; the platform mounts only the one that matches and
swaps it when the signal changes, without sending the slot again.

```tsx
const isLoggedIn = signal(false);

<Show when={isLoggedIn} fallback={<LoginButton />}>
  <Dashboard />
</Show>;
```

```tsx
const status = signal<"idle" | "loading" | "error" | "timeout">("idle");

<Match.Value of={status}>
  <Match.When is="idle"><Idle /></Match.When>
  <Match.When is="loading"><Spinner /></Match.When>
  <Match.When oneOf={["error", "timeout"]}><ErrorView /></Match.When>
  <Match.Default><Unknown /></Match.Default>
</Match.Value>;
```

`Match.When` takes exactly one operator, and `Show` takes one optionally:

| Operator | Matches |
|---|---|
| `is={v}` | the value `v` (`Object.is`) |
| `oneOf={[a, b]}` | any of the values |
| `gt`, `gte`, `lt`, `lte` | numbers; any other value does not match |
| `startsWith`, `endsWith`, `includes` | strings; any other value does not match |
| `condition={…}` | a condition built with predicates |

For ranges and combinations, build a `condition` with the predicates of
`@tiendanube/nube-sdk-jsx/predicates`: `is`, `oneOf`, `gt`, `gte`, `lt`,
`lte`, `startsWith`, `endsWith`, `includes`, `and`, `or` and `not`.

```tsx
import { and, gt, gte, lt, lte, or, startsWith } from "@tiendanube/nube-sdk-jsx/predicates";

const score = signal(0);
const cep = signal("");

<Match.Value of={score}>
  <Match.When condition={and(gte(90), lte(100))}><Excellent /></Match.When>
  <Match.When condition={or(lt(0), gt(100))}><Invalid /></Match.When>
  <Match.When gte={60}><Pass /></Match.When>
  <Match.Default><Fail /></Match.Default>
</Match.Value>;

<Show when={cep} condition={or(startsWith("01"), startsWith("02"))}>
  <SameDayShipping />
</Show>;
```

- Predicates only build JSON; the platform evaluates it on the page. No code of
  the app runs there.
- Values are never converted: `"10"` is not greater than `5`. A condition the
  platform cannot read is `false`.
- `when` and `of` only take signals. Without an operator, `Show` renders
  `children` only while the value is `true`; with one, `when` can hold any
  primitive and the operator is checked against its type.
- `Match.Value` renders the first `Match.When` that matches, or
  `Match.Default`. Values are strings, numbers, booleans or `null`.
- `computed` still works for anything the operators do not cover:
  `<Show when={computed(() => cart.value.length > 0, [cart])}>`.
- Switching branches unmounts the previous one, so its state is lost. Changing
  the value inside the same branch (`"error"` → `"timeout"` above) keeps it.
- A tree can only use signals of its own app.

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
  one message per microtask. Only signals that were rendered in a tree are
  sent: a signal used only inside the app, such as a store behind a computed
  label, never leaves the worker;
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
