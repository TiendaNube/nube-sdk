---
title: Text Component
---

# Text

El componente `text` se utiliza para renderizar texto con estilización opcional.
Soporta propiedades como `color`, `background`, niveles de `heading` (h1-h6),
`modifiers` de formato de texto (negrita, cursiva, etc.) y visualización en línea.

## Usage

::: code-group

```tsx [JSX]
import { Text } from "@tiendanube/nube-sdk-jsx";

<Text>Hola Mundo</Text>;
```

```typescript [Declarative]
import { text } from "@tiendanube/nube-sdk-ui";

text({
  text: "Hola Mundo",
});
```

:::

## Propiedades

| Property   | Type                         | Required | Description                                                                  |
| ---------- | ---------------------------- | -------- | ---------------------------------------------------------------------------- |
| text       | string                       | Si       | El contenido de texto a mostrar.                                             |
| color      | string                       | No       | El color del texto (puede ser una variable CSS como "var(--primary-color)"). |
| background | string                       | No       | El color de fondo (puede ser una variable CSS como "var(--primary-color)").  |
| heading    | 1\|2\|3\|4\|5\|6             | No       | El nivel del encabezado (h1-h6).                                             |
| modifiers  | TxtModifier[]                | No       | Array de modificadores de formato de texto.                                  |
| inline     | boolean                      | No       | Si el texto debe mostrarse en línea.                                         |

### Valores de propiedad

| Tipo        | Valor                                                                                             | Descripción                                            |
| ----------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| TxtModifier | "bold"<br/>"italic"<br/>"underline"<br/>"strike"<br/>"lowercase"<br/>"uppercase"<br/>"capitalize" | Define los posibles modificadores de formato de texto. |
