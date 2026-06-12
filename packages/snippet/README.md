# @tiendanube/nube-sdk-snippet

Type definitions for the NubeSDK snippet environment.

Snippets are TSX fragments that run in a Web Worker context managed by the platform. Unlike full NubeSDK apps, snippets do not import anything explicitly — all SDK globals (`nube`, `Box`, `styled`, etc.) are injected by the build system.

This package declares those globals so you get full TypeScript/IntelliSense support when writing snippets.

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

## Installation

```bash
npm install --save-dev @tiendanube/nube-sdk-snippet
```

## Peer Dependencies

- `@tiendanube/nube-sdk-types`
- `@tiendanube/nube-sdk-jsx`
- `@tiendanube/nube-sdk-ui`
