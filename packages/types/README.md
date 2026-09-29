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
- `NubeSDKListenableEvent` → Events that apps can listen to.
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

## Official Documentation

For more details about NubeSDK and how to build apps, check out our **official documentation**:

🔗 **[NubeSDK Documentation](https://nuvemshop.dev/en-US/apps/nube-sdk/overview)**

- [Getting started](https://nuvemshop.dev/en-US/apps/nube-sdk/getting-started)
  - How to set up the environment and create your first app
- [Events](https://nuvemshop.dev/en-US/apps/nube-sdk/events/overview)
  - All the events your app can send and listen
- [State](https://nuvemshop.dev/en-US/apps/nube-sdk/state/overview)
  - Complete definition of the store data that can be accessed
- [API](https://nuvemshop.dev/en-US/apps/nube-sdk/api/overview)
  - Integration layer with checkout, analytics, and more

## Support

- **Questions?** Use [GitHub Issues](https://github.com/TiendaNube/nube-sdk/issues).
- **Found a bug?** Open an issue with a reproducible example.

---

© [Nuvemshop / Tiendanube](https://nuvemshop.dev), 2026. All rights reserved.
