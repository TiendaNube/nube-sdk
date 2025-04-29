---
title: Fragment Component
---

# Fragment

El `fragment` es un componente utilitario que sirve como un elemento de agrupamiento lógico.
Permite que múltiples componentes se agrupen sin introducir un nodo DOM adicional.
Esto es particularmente útil cuando necesitas retornar múltiples elementos de un componente
sin agregar elementos de encapsulamiento innecesarios al DOM.

## Usage

::: code-group

```tsx [JSX]
import { Fragment } from "@tiendanube/nube-sdk-jsx";

<Fragment>
  <Text>Primer elemento</Text>
  <Text>Segundo elemento</Text>
</Fragment>;
```

```typescript [Declarative]
import { fragment } from "@tiendanube/nube-sdk-ui";

fragment({
  children: [
    {
      type: "text",
      text: "Primer elemento",
    },
    {
      type: "text",
      text: "Segundo elemento",
    },
  ],
});
```

:::

## Properties

| Property | Type              | Required | Description                                                   |
| -------- | ----------------- | -------- | ------------------------------------------------------------- |
| children | NubeComponent[]   | No       | Los componentes hijos a agrupar.                              |

## Cuándo Usar

- Cuando necesitas retornar múltiples elementos de un componente
- Cuando quieres agrupar elementos sin agregar nodos DOM extras
- Cuando necesitas mantener una estructura DOM limpia
- Cuando trabajas con listas o renderizado condicional
