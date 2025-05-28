---
title: Column Component
---

# Column

Una `column` es un contenedor vertical flexible que se puede utilizar para estructurar layouts.
Hereda la mayoría de las propiedades de `box`, excepto la propiedad `direction`.

## Uso

::: code-group

```tsx [JSX]
import { Column } from "@tiendanube/nube-sdk-jsx";

<Column>
  <Text>Contenido de la columna</Text>
</Column>;
```

```typescript [Declarative]
import { column } from "@tiendanube/nube-sdk-ui";

column({
  children: [
    {
      type: "text",
      text: "Contenido de la columna",
    },
  ],
});
```

:::

## Properties

| Property       | Type                  | Required | Description                                                                                          |
| -------------- | --------------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| children | NubeComponent[]              | No       | Los componentes hijos que se renderizarán dentro de la columna. |
| gap      | string                       | No       | El espaciado entre los elementos hijos.                         |
| padding  | string                       | No       | El relleno interno de la columna.                               |
| width    | string                       | No       | El ancho de la columna.                                         |
| height   | string                       | No       | La altura de la columna.                                        |
| align    | "start"<br/>"center"<br/>"end" | No       | La alineación vertical de los elementos hijos.                  |
| reverse        | boolean               | No       | Si los hijos deben envolver a la siguiente línea cuando se acabe el espacio.                         |
| background     | string                | No       | Color de fondo (puede ser una variable CSS como "var(--primary-color)").                            |
| color          | string                | No       | Color del contenido (puede ser una variable CSS como "var(--primary-color)").                       |
| alignItems     | FlexItems             | No       | La propiedad CSS [align-items](https://developer.mozilla.org/en-US/docs/Web/CSS/align-items)       |
| alignContent   | FlexContent           | No       | La propiedad CSS [align-content](https://developer.mozilla.org/en-US/docs/Web/CSS/align-content)   |
| justifyContent | FlexContent           | No       | La propiedad CSS [justify-content](https://developer.mozilla.org/en-US/docs/Web/CSS/justify-content) |
| id             | string                | No       | Identificador único opcional para el componente.                                                     |

### Property values

| Type                  | Value                                                                          | Description                                                                                     |
| --------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| NubeChildrenComponent | NubeComponent<br/>NubeComponent[]                                              | Define los valores posibles de alineación para el contenido del contenedor flexible.            |
| FlexContent           | "start"<br/>"center"<br/>"space-between"<br/>"space-around"<br/>"space-evenly" | Define los valores posibles de alineación para el contenido del contenedor flexible.            |
| FlexItems             | "start"<br/>"center"<br/>"end"<br/>"stretch";                                  | Define los valores posibles de alineación para los elementos flexibles.                         |
| SizeUnit              | "em"<br/>"rem"<br/>"px"<br/>"%"                                                | Define las unidades para mediciones de tamaño.                                                  |
| Size                  | `${number}${SizeUnit}`<br/>number<br/>"auto"                                   | Representa una definición de tamaño flexible.<br/>Puede ser un número, una cadena con unidad o "auto". |
