# Browser API's

By default, the WebWorks runtime in the browser does not provide direct access to [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) or [sessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage). These APIs are part of the main thread’s window context and are not natively available inside web workers.

To overcome this limitation and enable NubeSDK applications to use these storage APIs transparently, the NubeSDK includes an internal mechanism that exposes both `localStorage` and `sessionStorage` within the worker environment.

## localStorage and sessionStorage

The `nube` object exposes a method called `getBrowserAPIs`, which returns an interface with support for asynchronous access to browser APIs. These include `asyncLocalStorage` and `asyncSessionStorage`, which return promises for use within asynchronous contexts.

## How to Use

The next example uses the `setItem` method from `asyncSessionStorage` to store a new value.

```typescript title="main.ts"
import type { NubeSDK } from "@tiendanube/nube-sdk-types";

export function App(nube: NubeSDK) {
  const browser = nube.getBrowserAPIs();

  browser.asyncSessionStorage
    .setItem("my_custom_field", "Hello World!")
    .then(() => {
      console.log("Item set in async session storage");
    });
}
```

The next example uses the `getItem` method from `asyncSessionStorage` to retrieve a stored value.

```typescript title="main.ts"
import type { NubeSDK } from "@tiendanube/nube-sdk-types";

export function App(nube: NubeSDK) {
  const browser = nube.getBrowserAPIs();

  browser.asyncSessionStorage.getItem("my_custom_field").then((value) => {
    console.log("my_custom_field", value);
  });
}
```

## Time To Live

Both `asyncLocalStorage` and `asyncSessionStorage` support an optional third parameter called `ttl` (time-to-live), which defines how long the stored value should remain valid, in seconds.

When provided, the `ttl` determines the expiration time for the key. Once the specified duration has passed, the value will no longer be accessible via `getItem`, and it will be treated as if it were removed.

```typescript title="main.ts"
// Store a value that expires in 60 seconds
await browser.asyncLocalStorage.setItem("my_custom_field", "Hello World!", 60);
```

If no `ttl` is provided, the value will persist indefinitely, following the default behavior of `localStorage` and `sessionStorage`.
