# NubeSDK

**A development toolkit for creating third-party apps within the Nuvemshop platform.**

> [!IMPORTANT]  
> NubeSDK is currently in its **beta phase**, and new features are still being implemented. Developers interested in using this SDK should **contact the Nuvemshop / Tiendanube team before integration** to ensure compatibility and receive support.


## About

NubeSDK provides a suite of libraries that enable developers to create **secure, declarative, and extensible applications** inside the Nuvemshop ecosystem. Apps built with NubeSDK run inside **isolated web workers**, ensuring a controlled execution environment without direct access to the DOM.

This monorepo contains several key packages that facilitate different aspects of NubeSDK development:

- [`@tiendanube/nube-sdk-types`](https://github.com/TiendaNube/nube-sdk/tree/main/packages/types) →  TypeScript definitions for NubeSDK.
- [`@tiendanube/nube-sdk-ui`](https://github.com/TiendaNube/nube-sdk/tree/main/packages/ui) → Functions for building declarative UI components.
- [`@tiendanube/nube-sdk-jsx`](https://github.com/TiendaNube/nube-sdk/tree/main/packages/jsx) → JSX runtime for writing UI components using JSX/TSX.

## Installation

Each package can be installed separately based on your project requirements. For example, to use UI components with JSX support:

```sh
npm install @tiendanube/nube-sdk-jsx @tiendanube/nube-sdk-ui @tiendanube/nube-sdk-types
```

## Example Usage

```tsx
import type { NubeApp } from "@tiendanube/nube-types";
import { Box, Row, Col, Txt, Field } from "@tiendanube/nube-sdk-jsx";

const Component = () => (
  <Box>
    <Row>
      <Col>
        <Txt>Hello, NubeSDK!</Txt>
      </Col>
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

- **Minimal app setup:** [`examples/minimal`](https://github.com/TiendaNube/nube-sdk/tree/main/examples/minimal)
- **Minimal with UI:** [`examples/minimal-ui`](https://github.com/TiendaNube/nube-sdk/tree/main/examples/minimal-ui)
- **Minimal with UI in JSX:** [`examples/minimal-ui-jsx`](https://github.com/TiendaNube/nube-sdk/tree/main/examples/minimal-ui-jsx)

These examples include **pre-configured build setups**, ensuring a seamless development experience.

## Official Documentation

For more details about NubeSDK and how to build apps, check out our **official documentation**:

**[NubeSDK Documentation](https://dev.tiendanube.com/docs/applications/nube-sdk/overview)**

## Support

- **Questions?** Use [GitHub Issues](https://github.com/TiendaNube/nube-sdk/issues).
- **Found a bug?** Open an issue with a reproducible example.

---

© [Tiendanube / Nuvemshop](https://www.tiendanube.com), 2025. All rights reserved.


