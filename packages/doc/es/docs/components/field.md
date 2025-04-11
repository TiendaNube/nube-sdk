---
title: Field Component
---

# Field

Un `field` representa un elemento de entrada de texto en un formulario.
Soporta propiedades como `name`, `label` y manejadores de eventos (`onChange`, `onBlur`, `onFocus`).

## Usage

::: code-group

```tsx [JSX]
import { Field } from "@tiendanube/nube-sdk-jsx";

<Field
  name="email"
  label="Email"
  onChange={() => {}}
  onBlur={() => {}}
  onFocus={() => {}}
/>;
```

```typescript [Declarative]
import { field } from "@tiendanube/nube-sdk-ui";

field({
  name: "email",
  label: "Email",
  onChange: () => {},
  onBlur: () => {},
  onFocus: () => {},
});
```

:::

### Event Handlers

El componente field soporta tres manejadores de eventos que reciben un objeto con las siguientes propiedades:

```typescript
onChange: (data: {
  type: "change";       // El tipo del evento
  state: NubeSDKState;  // El estado actual del SDK
  value?: string;       // El nuevo valor del campo
}) => void

onBlur: (data: {
  type: "blur";         // El tipo del evento
  state: NubeSDKState;  // El estado actual del SDK
  value?: string;       // El valor actual del campo
}) => void

onFocus: (data: {
  type: "focus";        // El tipo del evento
  state: NubeSDKState;  // El estado actual del SDK
  value?: string;       // El valor actual del campo
}) => void
```

Example usage:

::: code-group

```tsx [JSX]
import { Field } from "@tiendanube/nube-sdk-jsx";
import type { NubeComponentFieldEventHandler } from "@tiendanube/nube-sdk-types";

const handleEvents: NubeComponentFieldEventHandler = (event) => {
  const { type, value, state } = event;
  // Ejecutar alguna acción
};

<Field
  name="email"
  label="Email"
  onChange={handleEvents}
  onBlur={handleEvents}
  onFocus={handleEvents}
/>;
```

```typescript [Declarative]
import { field } from "@tiendanube/nube-sdk-ui";
import type { NubeComponentFieldEventHandler } from "@tiendanube/nube-sdk-types";

const handleEvents: NubeComponentFieldEventHandler = (event) => {
  const { type, value, state } = event;
  // Ejecutar alguna acción
};

field({
  name: "email",
  label: "Email",
  onChange: handleEvents,
  onBlur: handleEvents,
  onFocus: handleEvents,
});
```

:::

## Properties

| Property | Type                           | Required | Description                                                   |
| -------- | ------------------------------ | -------- | ------------------------------------------------------------- |
| name     | string                         | Yes      | El nombre del campo, usado para identificarlo en formularios. |
| label    | string                         | Yes      | El texto de la etiqueta mostrado encima del campo.            |
| onChange | NubeComponentFieldEventHandler | No       | Función llamada cuando el valor del campo cambia.             |
| onBlur   | NubeComponentFieldEventHandler | No       | Función llamada cuando el campo pierde el foco.               |
| onFocus  | NubeComponentFieldEventHandler | No       | Función llamada cuando el campo recibe el foco.               |

### Property values

| Type                           | Value                                                                                                     | Description                              |
| ------------------------------ | --------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| NubeComponentFieldEventHandler | (data: {<br/>type: "change" \| "blur" \| "focus"; state: NubeSDKState;<br/>value?: string;<br/>}) => void | Función manejadora de eventos del campo. |
