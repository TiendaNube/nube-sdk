---
title: Text Component
---

# Text

O componente `text` é usado para renderizar texto com estilização opcional.
Ele suporta propriedades como `color`, `background`, níveis de `heading` (h1-h6),
`modifiers` de formatação de texto (negrito, itálico, etc.) e exibição em linha.

## Usage

::: code-group

```tsx [JSX]
import { Text } from "@tiendanube/nube-sdk-jsx";

<Text>Olá Mundo</Text>;
```

```typescript [Declarative]
import { text } from "@tiendanube/nube-sdk-ui";

text({
  text: "Olá Mundo",
});
```

:::

## Properties

| Property   | Type                         | Required | Description                                                             |
| ---------- | ---------------------------- | -------- | ----------------------------------------------------------------------- |
| text       | string                       | Yes      | O conteúdo de texto a ser exibido.                                      |
| color      | string                       | No       | A cor do texto (pode ser uma variável CSS como "var(--primary-color)"). |
| background | string                       | No       | A cor de fundo (pode ser uma variável CSS como "var(--primary-color)"). |
| heading    | 1\|2\|3\|4\|5\|6             | No       | O nível do cabeçalho (h1-h6).                                           |
| modifiers  | TxtModifier[]                | No       | Array de modificadores de formatação de texto.                          |
| inline     | boolean                      | No       | Se o texto deve ser exibido em linha.                                   |

### Property values

| Type        | Value                                                                                             | Description                                               |
| ----------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| TxtModifier | "bold"<br/>"italic"<br/>"underline"<br/>"strike"<br/>"lowercase"<br/>"uppercase"<br/>"capitalize" | Define os possíveis modificadores de formatação de texto. |
