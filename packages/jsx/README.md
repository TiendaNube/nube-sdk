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
    </>
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

## Project Setup

To scaffold a project already configured for JSX, use the CLI and pick the **Minimal with UI in JSX** template:

```sh
npm create nube-app@latest
```

The generated project comes with a **pre-configured setup**:

- `tsup` for building the project.
- `tsconfig.json` properly set up for JSX support.
- No need to manually specify the JSX runtime.

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

