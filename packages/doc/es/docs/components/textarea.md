---
title: Textarea Component
---

# Textarea

Un `textarea` representa un campo de entrada de texto multilínea que permite a los usuarios ingresar textos más largos.
Soporta propiedades como `name`, `label` y manejadores de eventos (`onChange`, `onBlur`, `onFocus`).

## Uso

::: code-group

```tsx [JSX]
import { Textarea } from "@tiendanube/nube-sdk-jsx";

<Textarea
  name="description"
  label="Description"
  value="example@example.com"
  maxLength={500}
  rows={4}
  onChange={() => {}}
  onBlur={() => {}}
  onFocus={() => {}}
/>;
```

```typescript [Declarative]
import { textarea } from "@tiendanube/nube-sdk-ui";

textarea({
  name: "description",
  label: "Description",
  value: "example@example.com",
  maxLength: 500,
  rows: 4,
  onChange: () => {},
  onBlur: () => {},
  onFocus: () => {},
});
```

:::

### Manejadores de eventos

El componente textarea soporta tres manejadores de eventos que reciben un objeto con las siguientes propiedades:

```typescript
onChange: (data: {
  type: "change";       // El tipo del evento
  state: NubeSDKState;  // El estado actual del SDK
  value?: string;       // El nuevo valor del textarea
}) => void

onBlur: (data: {
  type: "blur";         // El tipo del evento
  state: NubeSDKState;  // El estado actual del SDK
  value?: string;       // El valor actual del textarea
}) => void

onFocus: (data: {
  type: "focus";        // El tipo del evento
  state: NubeSDKState;  // El estado actual del SDK
  value?: string;       // El valor actual del textarea
}) => void
```

Ejemplo de uso:

::: code-group

```tsx [JSX]
import { Textarea } from "@tiendanube/nube-sdk-jsx";
import type { NubeComponentTextareaEventHandler } from "@tiendanube/nube-sdk-types";

const handleEvents: NubeComponentTextareaEventHandler = (event) => {
  const { type, value, state } = event;
  // Ejecutar alguna acción
};

<Textarea
  name="description"
  label="Description"
  value="example@example.com"
  maxLength={500}
  rows={4}
  onChange={handleEvents}
  onBlur={handleEvents}
  onFocus={handleEvents}
/>;
```

```typescript [Declarative]
import { textarea } from "@tiendanube/nube-sdk-ui";
import type { NubeComponentTextareaEventHandler } from "@tiendanube/nube-sdk-types";

const handleEvents: NubeComponentTextareaEventHandler = (event) => {
  const { type, value, state } = event;
  // Ejecutar alguna acción
};

textarea({
  name: "description",
  label: "Description",
  value: "example@example.com",
  maxLength: 500,
  rows: 4,
  onChange: handleEvents,
  onBlur: handleEvents,
  onFocus: handleEvents,
});
```