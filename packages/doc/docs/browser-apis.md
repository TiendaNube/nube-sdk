# Browser API's

NubeSDK provides a secure and standardized interface to interact with common browser features inside Web Workers — a runtime model used to safely execute partner apps in isolation from the main application.

Because Web Workers do not have direct access to many standard browser features, NubeSDK offers the `getBrowserAPIs()` method, which exposes a set of safe, high-level interfaces that allow partner apps to interact with selected browser capabilities through a controlled and asynchronous API surface.

These abstractions are designed to align with NubeSDK’s principles of security, consistency, and developer experience — enabling richer integrations without sacrificing control or performance.

Additional browser capabilities will be introduced over time, always following this philosophy of safe and transparent access.

## Web Storage API

The [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) and [sessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage) APIs are part of the main thread’s `window` context and are not natively available inside Web Workers.

To provide access to these storage mechanisms in a secure and compatible way, NubeSDK exposes `asyncLocalStorage` and `asyncSessionStorage` through the `getBrowserAPIs()` method. These interfaces return `promises` and are designed to following the SDK’s asynchronous execution model.

### How to Use

The next example uses the `setItem` method from `asyncSessionStorage` to store a new value.

```typescript
import type { NubeSDK } from "@tiendanube/nube-sdk-types";

export function App(nube: NubeSDK) {
  const browser = nube.getBrowserAPIs();

  browser.asyncSessionStorage
    .setItem("my_custom_field", "Hello World!")
    .then(() => {
      console.log("Item set in session storage");
    });
}
```

The next example uses the `getItem` method from `asyncSessionStorage` to retrieve a stored value.

```typescript
import type { NubeSDK } from "@tiendanube/nube-sdk-types";

export function App(nube: NubeSDK) {
  const browser = nube.getBrowserAPIs();

  browser.asyncSessionStorage.getItem("my_custom_field").then((value) => {
    console.log("my_custom_field", value);
  });
}
```

### Time To Live

Both `asyncLocalStorage` and `asyncSessionStorage` support an optional parameter called `ttl` (time-to-live), which defines how long the stored value should remain valid, in seconds.

When provided, the `ttl` determines the expiration time for the key. Once the specified duration has passed, the value will no longer be accessible via `getItem`, and it will be treated as if it were removed.

```typescript
// Store a value that expires in 60 seconds
await browser.asyncLocalStorage.setItem("my_custom_field", "Hello World!", 60);
```

If no `ttl` is provided, the value will persist indefinitely, following the default behavior of `localStorage` and `sessionStorage`.
