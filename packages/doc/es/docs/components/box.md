---
title: Box Component
---

# Box

El componente `Box` es un contenedor flexible que se puede utilizar para fines de maquetación.

## Uso

::: code-group

```tsx [JSX]
import { Box } from "@tiendanube/nube-sdk-jsx";

<Box>
  <Text>Contenido del box</Text>
</Box>;
```

```typescript [Declarative]
import { box } from "@tiendanube/nube-sdk-ui";

box({
  children: [
    {
      type: "text",
      text: "Contenido del box",
    },
  ],
});
```

:::

## Propiedades

| Propiedad      | Tipo                           | Obligatorio | Descripción                                                                                          |
| -------------- | ------------------------------ | ----------- | ---------------------------------------------------------------------------------------------------- |
| children       | NubeComponent[]                | No          | Los componentes hijos que se renderizarán dentro del box.                                            |
| gap            | string                         | No          | El espaciado entre los elementos hijos.                                                              |
| padding        | string                         | No          | El relleno interno del box.                                                                          |
| margin         | string                         | No          | El margen externo del box.                                                                           |
| height         | string                         | No          | La altura del box.                                                                                   |
| align          | "start"<br/>"center"<br/>"end" | No          | La alineación de los elementos hijos.                                                                |
| direction      | "row"<br/>"column"             | No          | La dirección del layout flexible (horizontal o vertical).                                            |
| borderRadius   | Size                           | No          | Border radius of the box (e.g., "8px").                                                              |
| reverse        | boolean                        | No          | Whether children should wrap to the next line when space runs out.                                   |
| background     | string                         | No          | Background color (can be CSS variable like "var(--primary-color)").                                  |
| color          | string                         | No          | Content color (can be CSS variable like "var(--primary-color)").                                     |
| alignItems     | FlexItems                      | No          | The CSS property [align-items](https://developer.mozilla.org/en-US/docs/Web/CSS/align-items)         |
| alignContent   | FlexContent                    | No          | The CSS property [align-content](https://developer.mozilla.org/en-US/docs/Web/CSS/align-content)     |
| justifyContent | FlexContent                    | No          | The CSS property [justify-content](https://developer.mozilla.org/en-US/docs/Web/CSS/justify-content) |
| id             | string                         | No          | Optional unique identifier for the component.                                                        |

### Valores de propiedad

| Tipo                  | Valor                                                                          | Descripción                                                                                     |
| --------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| NubeComponent[]       | NubeComponent<br/>NubeComponent[]                                              | Defines possible alignment values for flex container content.                                   |
| FlexContent           | "start"<br/>"center"<br/>"space-between"<br/>"space-around"<br/>"space-evenly" | Defines possible alignment values for flex container content.                                   |
| FlexItems             | "start"<br/>"center"<br/>"end"<br/>"stretch";                                  | Defines possible alignment values for flex items.                                               |
| SizeUnit              | "em"<br/>"rem"<br/>"px"<br/>"%"                                                | Defines units for size measurements.                                                            |
| Size                  | `${number}${SizeUnit}`<br/>number<br/>"auto"                                   | Represents a flexible size definition.<br/>It can be a number, a string with a unit, or "auto". |
