---
title: Checkbox Component
---

# Checkbox

Un `checkbox` representa un campo seleccionable que puede alternar entre estados marcado y desmarcado.
Se utiliza típicamente para permitir que los usuarios seleccionen una o más opciones.
Soporta propiedades como `name`, `label`, `checked` y manejadores de eventos (`onChange`).

## Usage

::: code-group

```tsx [JSX]
import { Checkbox } from "@tiendanube/nube-sdk-jsx";

<Checkbox
  name="terms"
  label="I agree to the terms and conditions"
  checked={false}
  onChange={() => {}}
/>;
```

```typescript [Declarative]
import { checkbox } from "@tiendanube/nube-sdk-ui";

checkbox({
  name: "terms",
  label: "I agree to the terms and conditions",
  checked: false,
  onChange: () => {},
});
```

:::

### Event Handlers

El componente checkbox soporta un manejador de eventos que recibe un objeto con las siguientes propiedades:

```typescript
onChange: (data: {
  type: "change";       // El tipo del evento
  state: NubeSDKState;  // El estado actual del SDK
  value?: boolean;      // El nuevo estado marcado del checkbox
}) => void
```

Example usage:

::: code-group

```tsx [JSX]
import { Checkbox } from "@tiendanube/nube-sdk-jsx";
import type { NubeComponentCheckEventHandler } from "@tiendanube/nube-sdk-types";

const handleEvents: NubeComponentCheckEventHandler = (event) => {
  const { type, value, state } = event;
  // Ejecutar alguna acción
};

<Checkbox
  name="terms"
  label="I agree to the terms and conditions"
  checked={false}
  onChange={handleEvents}
/>;
```

```typescript [Declarative]
import { checkbox } from "@tiendanube/nube-sdk-ui";
import type { NubeComponentCheckEventHandler } from "@tiendanube/nube-sdk-types";

const handleEvents: NubeComponentCheckEventHandler = (event) => {
  const { type, value, state } = event;
  // Ejecutar alguna acción
};

checkbox({
  name: "terms",
  label: "I agree to the terms and conditions",
  checked: false,
  onChange: handleEvents,
});
```

:::

## Properties

| Property | Type                           | Required | Description                                                      |
| -------- | ------------------------------ | -------- | ---------------------------------------------------------------- |
| name     | string                         | Yes      | El nombre del checkbox, usado para identificarlo en formularios. |
| label    | string                         | Yes      | El texto de la etiqueta mostrada junto al checkbox.              |
| checked  | boolean                        | Yes      | El estado actual marcado del checkbox.                           |
| onChange | NubeComponentCheckEventHandler | No       | Función llamada cuando el estado del checkbox cambia.            |

### Property values

| Type                           | Value                                                                                 | Description                                 |
| ------------------------------ | ------------------------------------------------------------------------------------- | ------------------------------------------- |
| NubeComponentCheckEventHandler | (data: {<br/>type: "change"; state: NubeSDKState;<br/>value?: boolean;<br/>}) => void | Función manejadora de eventos del checkbox. |
