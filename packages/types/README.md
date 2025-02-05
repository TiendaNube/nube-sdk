# `@tiendanube/nube-sdk-types`

**TypeScript definitions for NubeSDK**, ensuring safety, consistency, and better integration with IDEs and code editors.


`@tiendanube/nube-sdk-types` provides **well-defined TypeScript types** for **NubeSDK**, simplifying the development of **third-party apps** within the **Nuvemshop** platform.

Apps in NubeSDK run **inside isolated web workers**, without direct access to the DOM. This package standardizes **data structures, events, and interfaces**, ensuring **type safety and consistency** in communication with the platform.

## Installation

```sh
npm install -D @tiendanube/nube-sdk-types
```

## Main Types

This package provides essential type definitions for NubeSDK integration, including:

### Application State

`NubeSDKState` → Represents the SDK's global state (cart, store, UI, etc.).

### Events

- `NubeSDKSendableEvent` → Events that can be sent to the SDK.
- `NubeSDKListenableEvent`  → Events that apps can listen to.
- `NubeSDKListener` → Function signature for event handlers.

### Data Models

- `Cart` → Represents the shopping cart structure.
- `Store` → Information about the store where the apps is running.
- `AppLocation` → Represents the user's current page within the platform.

### UI Components
- `NubeComponent` → Declarative representation of a UI component.
- `NubeComponentBox`, NubeComponentRow, NubeComponentField, etc. 

## Example Usage

```ts
import type { NubeSDK, NubeSDKState } from "@tiendanube/nube-sdk-types";

function App(nube: NubeSDK) {
  nube.on("cart:update", (state: NubeSDKState) => {
    console.log("Cart updated:", state.cart);
  });
}
```

## Example Project Setup

A minimal example project using `@tiendanube/nube-sdk-types` is available in the repository under:

- [`examples/minimal`](https://github.com/TiendaNube/nube-sdk/tree/main/examples/minimal)

This example include **pre-configured build setups**, ensuring a seamless development experience.

## Official Documentation

For more details about NubeSDK and how to build apps, check out our **official documentation**:

🔗 **[NubeSDK Documentation](https://dev.tiendanube.com/docs/applications/nube-sdk/overview)**

## Support

- **Questions?** Use [GitHub Issues](https://github.com/TiendaNube/nube-sdk/issues).
- **Found a bug?** Open an issue with a reproducible example.

---

© [Tiendanube / Nuvemshop](https://www.tiendanube.com), 2025. All rights reserved.
