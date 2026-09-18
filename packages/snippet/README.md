# `@tiendanube/nube-sdk-snippet`

**TypeScript definitions for the NubeSDK snippet environment**, giving you full type safety and IntelliSense when writing snippets.

Snippets are TSX fragments that run in a Web Worker context managed by the platform. Unlike full NubeSDK apps, snippets do not import anything explicitly — all SDK globals (`nube`, `Box`, `styled`, etc.) are injected by the build system.

This package declares those globals so you get full TypeScript/IntelliSense support when writing snippets.

## Installation

```sh
npm install -D @tiendanube/nube-sdk-snippet
```

> Note: `@tiendanube/nube-sdk-types`, `@tiendanube/nube-sdk-jsx`, and `@tiendanube/nube-sdk-ui` are peer dependencies and must be installed alongside this package.

## Usage

Add a triple-slash reference at the top of your snippet file:

```tsx
/// <reference types="@tiendanube/nube-sdk-snippet" />

const translations: Readonly<Record<LanguageKey, string>> = {
  pt: "Olá, bem-vindo!",
  es: "Hola, ¡bienvenido!",
  en: "Hi, welcome!"
};

function Greeting({ store }: NubeSDKState) {
  const lang = store.language
  const message = translations[lang]
  return <Text heading={1}>{message}</Text>
}

nube.render("before_main_content", Greeting)
```

## Available Globals

### SDK Instance

| Global | Type | Description |
|--------|------|-------------|
| `nube` | `NubeSDK` | Main entry point for interacting with the platform |

### JSX Components

All components from `@tiendanube/nube-sdk-jsx` are available as globals:

`Box`, `Column`, `Row`, `Text`, `Button`, `Link`, `Image`, `Icon`, `Field`, `NumberField`, `Select`, `Checkbox`, `Textarea`, `Fragment`, `Progress`, `Iframe`, `Markdown`, `SideScroll`, `Accordion`, `Toast`, `Svg`

### UI Utilities

All utilities from `@tiendanube/nube-sdk-ui` are available as globals:

| Global | Description |
|--------|-------------|
| `styled` | CSS-in-JS for component styling |
| `keyframes` | Defines CSS animations |
| `theme` | Access to theme tokens and variables |
| `StyleSheet` | Creates named style objects |

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
