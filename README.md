# NubeSDK

**A development toolkit for creating third-party apps within the Nuvemshop platform.**

## About

NubeSDK provides a suite of libraries that enable developers to create **secure, declarative, and extensible applications** inside the Nuvemshop ecosystem. Apps built with NubeSDK run inside **isolated web workers**, ensuring a controlled execution environment without direct access to the DOM.

This monorepo contains several key packages that facilitate different aspects of NubeSDK development:

- [`@tiendanube/nube-sdk-types`](https://github.com/TiendaNube/nube-sdk/tree/main/packages/types) →  TypeScript definitions for NubeSDK.
- [`@tiendanube/nube-sdk-ui`](https://github.com/TiendaNube/nube-sdk/tree/main/packages/ui) → Functions for building declarative UI components.
- [`@tiendanube/nube-sdk-jsx`](https://github.com/TiendaNube/nube-sdk/tree/main/packages/jsx) → JSX runtime for writing UI components using JSX/TSX.
- [`create-nube-app`](https://github.com/TiendaNube/nube-sdk/tree/main/packages/create-nube-app) → CLI tool for scaffolding and setting up new Nube applications.

## Installation

To quickly create a new Nube application, you can use the CLI tool create-nube-app. Simply run the command below, which will scaffold a complete project with all the necessary dependencies:

```sh
npm create nube-app@latest
```

```sh
yarn create nube-app
```

```sh
pnpm create nube-app
```

```sh
bun create nube-app
```

## Example Usage

```tsx
import type { NubeApp } from "@tiendanube/nube-sdk-types";
import { Box, Row, Column, Text, Field } from "@tiendanube/nube-sdk-jsx";

const Component = () => (
  <Box>
    <Row>
      <Column>
        <Text>Hello, NubeSDK!</Text>
      </Column>
    </Row>
    <Field name="email" label="Email" />
  </Box>
);

export const App: NubeApp = (nube) => {
  nube.send("ui:slot:set", () => ({
    ui: {
      slots: {
        before_main_content: <Component />
      }
    }
  }));
}
```

## Example Projects

This repository includes example projects to help you get started quickly:

- **Minimal app setup:** [`examples/minimal`](https://github.com/TiendaNube/nube-sdk/tree/main/packages/create-nube-app/templates/minimal)
- **Minimal with UI:** [`examples/minimal-ui`](https://github.com/TiendaNube/nube-sdk/tree/main/packages/create-nube-app/templates/minimal-ui)
- **Minimal with UI in JSX:** [`examples/minimal-ui-jsx`](https://github.com/TiendaNube/nube-sdk/tree/main/packages/create-nube-app/templates/minimal-ui-jsx)

These examples include **pre-configured build setups**, ensuring a seamless development experience.

## Official Documentation

For more details about NubeSDK and how to build apps, check out our **official documentation**:

**[NubeSDK Documentation](https://dev.tiendanube.com/docs/applications/nube-sdk/overview)**

## Support

- **Questions?** Use [GitHub Issues](https://github.com/TiendaNube/nube-sdk/issues).
- **Found a bug?** Open an issue with a reproducible example.

---

© [Tiendanube / Nuvemshop](https://www.tiendanube.com), 2025. All rights reserved.


