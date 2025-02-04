# `@tiendanube/nube-sdk-jsx`

**Library for building JSX-based UI components in NubeSDK.**

## About

`@tiendanube/nube-sdk-jsx` enables developers to use **JSX/TSX syntax** to define UI components declaratively within **NubeSDK**. This package simplifies UI development by allowing a more familiar and ergonomic way to create interfaces while maintaining compatibility with the NubeSDK UI system.

Apps in NubeSDK run **inside isolated web workers**, without direct access to the DOM. This package ensures that JSX components are converted into structured objects, which are then interpreted by the platform for rendering.

## Installation

```sh
npm install @tiendanube/nube-sdk-jsx @tiendanube/nube-sdk-ui @tiendanube/nube-sdk-types
```

> Note: `@tiendanube/nube-sdk-ui` and `@tiendanube/nube-sdk-types` are peer dependencies and must be installed alongside this package.

## Example Usage

```tsx
import type { NubeSDK } from "@tiendanube/nube-sdk-types";
import { Field } from "@tiendanube/nube-sdk-jsx";

function MyComponent() {
  return (
    <>
      <Field
        label="First Name"
        name="firstname"
        onChange={(e) => {
          console.log(`User first name: ${e.value}`);
        }}
      />
      <Field
        label="Last Name"
        name="lastname"
        onChange={(e) => {
          console.log(`User last name: ${e.value}`);
        }}
      />
    <>
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

## Example Project Setup

A minimal example project using `@tiendanube/nube-sdk-jsx` is available in the repository under:

This repository includes example projects to help you get started quickly:

- [`examples/minimal-ui-jsx`](https://github.com/TiendaNube/nube-sdk/tree/main/examples/minimal-ui-jsx)

This example includes a **pre-configured setup** with:
- `tsup` for building the project.
- `tsconfig.json` properly set up for JSX support.
- No need to manually specify the JSX runtime.

Developers can refer to this project as a starting point to quickly integrate JSX components with NubeSDK.

## Official Documentation

For more details about NubeSDK and how to build apps, check out our **official documentation**:

[**NubeSDK Documentation**](https://dev.tiendanube.com/docs/applications/nube-sdk/overview)

## Support

- **Questions?** Use [GitHub Issues](https://github.com/TiendaNube/nube-sdk/issues).
- **Found a bug?** Open an issue with a reproducible example.

---

© [Tiendanube / Nuvemshop](https://www.tiendanube.com), 2025. All rights reserved.


