# `@tiendanube/nube-sdk-ui`

**Library for building declarative UI components in NubeSDK.**

## About

`@tiendanube/nube-sdk-ui` provides **a set of functions** to create UI components declaratively within **NubeSDK**. This package allows developers to define UI components as structured objects, ensuring that UI components are safely structured and passed to the platform for rendering.

This package follows a **declarative approach**, where UI is described as data instead of imperative code. These structured objects are later interpreted by the platform to generate the final UI.

Apps in NubeSDK run **inside isolated web workers**, without direct access to the DOM. This ensures security, consistency, and predictable rendering behavior.

## Installation

```sh
npm install @tiendanube/nube-sdk-ui @tiendanube/nube-sdk-types
```

> Note: `@tiendanube/nube-sdk-types` is a peer dependency and must be installed alongside this package.

## Main Components

This package provides utility functions for creating UI components in **NubeSDK**, including:

### Layout Components

- `box` → Creates a flexible container for structuring layouts.
- `col` → Defines a column layout inside a row or another container.
- `row` → Defines a horizontal layout with flexible positioning.

### Interactive Components

- `field` → Represents an input element such as text fields, dropdowns, or checkboxes.

### Visual Components

- `img` → Displays an image with support for responsive sources.
- `txt` → Renders text with optional formatting.

### Structural Components

- `fragment` → Groups multiple components without introducing an additional structural wrapper.

## Example Usage

```ts
import { box, col, row, field, img, txt, fragment } from "@tiendanube/nube-sdk-ui";

const componentTree = box({
  children: [
    row({
      children: [
        col({ children: txt({ children: "Hello, NubeSDK!" }) }),
      ],
    }),
    field({ name: "email", label: "Email" })
  ]
});
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
