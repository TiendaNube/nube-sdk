---
title: Button Component
---

# Button

Un `button` es un elemento clicable usado para activar acciones.
Soporta propiedades como texto, onClick y configuraciones de estilo.

## Uso

::: code-group

```tsx [JSX]
import { Button } from "@tiendanube/nube-sdk-jsx";

<Button variant="primary" onClick={() => {}}>
  Haz clic aquí
</Button>;
```

```typescript [Declarativo]
import { button } from "@tiendanube/nube-sdk-ui";

button({
  children: "Haz clic aquí",
  variant: "primary",
  onClick: () => {},
});
```

:::

### Manejadores de Eventos

El manejador `onClick` recibe un objeto con las siguientes propiedades:

```typescript
onClick: (data: {
  type: "click";           // El tipo del evento
  state: NubeSDKState;     // El estado actual del SDK
}) => void
```

Ejemplo de uso:

::: code-group

```tsx [JSX]
import { Button } from "@tiendanube/nube-sdk-jsx";

<Button onClick={({ state }) => {
  // Acceder al estado actual
  console.log(state);
  // Ejecutar alguna acción
}}>
  Haz clic aquí
</Button>;
```

```typescript [Declarativo]
import { button } from "@tiendanube/nube-sdk-ui";

button({
  children: "Haz clic aquí",
  onClick: ({ state }) => {
    // Acceder al estado actual
    console.log(state);
    // Ejecutar alguna acción
  }
});
```

:::

## Propiedades

| Propiedad | Tipo                                                | Requerido | Descripción                                      |
| --------- | --------------------------------------------------- | --------- | ------------------------------------------------ |
| children  | string                                              | No        | Texto o contenido del botón.                     |
| disabled  | boolean                                             | No        | Si el botón está deshabilitado.                  |
| variant   | "primary" \| "secondary" \| "transparent" \| "link" | No        | Variante de estilo del botón.                    |
| width     | Size                                                | No        | Ancho del botón (ej: "100%", "200px").           |
| height    | Size                                                | No        | Altura del botón.                                |
| onClick   | NubeComponentButtonEventHandler                     | No        | Función llamada cuando se hace clic en el botón. |

### Valores de las propiedades

| Tipo                            | Valor                                                   | Descripción                                                                                        |
| ------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Size                            | `${number}${SizeUnit}` \| number \| "auto"              | Representa una definición de tamaño flexible. Puede ser un número, una cadena con unidad o "auto". |
| SizeUnit                        | "em" \| "rem" \| "px" \| "%"                            | Define unidades para medidas de tamaño.                                                            |
| NubeComponentButtonEventHandler | (data: { type: "click"; state: NubeSDKState; }) => void | Función manejadora de eventos del botón.                                                           |
