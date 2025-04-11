---
title: Box Component
---

# Box

Um `box` é um container flexível que pode ser usado para fins de layout.
Ele suporta propriedades como largura, altura, preenchimento, margem e alinhamento baseado em flex.

## Usage

::: code-group

```tsx [JSX]
import { Box } from "@tiendanube/nube-sdk-jsx";

<Box>
  <Text>Conteúdo do box</Text>
</Box>;
```

```typescript [Declarative]
import { box } from "@tiendanube/nube-sdk-ui";

box({
  children: [
    {
      type: "text",
      text: "Conteúdo do box",
    },
  ],
});
```

:::

## Properties

| Property | Type                         | Required | Description                                                    |
| -------- | ---------------------------- | -------- | -------------------------------------------------------------- |
| children | NubeComponent[]              | No       | Os componentes filhos que serão renderizados dentro do box.    |
| gap      | string                       | No       | O espaçamento entre os elementos filhos.                       |
| padding  | string                       | No       | O preenchimento interno do box.                                |
| margin   | string                       | No       | A margem externa do box.                                       |
| width    | string                       | No       | A largura do box.                                              |
| height   | string                       | No       | A altura do box.                                               |
| align    | "start" \| "center" \| "end" | No       | O alinhamento dos elementos filhos.                            |
| direction| "row" \| "column"            | No       | A direção do layout flexível (horizontal ou vertical).         |

## Additional Properties

| Property       | Type                  | Required | Description                                                                                          |
| -------------- | --------------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| reverse        | boolean               | No       | Whether children should wrap to the next line when space runs out.                                   |
| background     | string                | No       | Background color (can be CSS variable like "var(--primary-color)").                                  |
| color          | string                | No       | Content color (can be CSS variable like "var(--primary-color)").                                     |
| alignItems     | FlexItems             | No       | The CSS property [align-items](https://developer.mozilla.org/en-US/docs/Web/CSS/align-items)         |
| alignContent   | FlexContent           | No       | The CSS property [align-content](https://developer.mozilla.org/en-US/docs/Web/CSS/align-content)     |
| justifyContent | FlexContent           | No       | The CSS property [justify-content](https://developer.mozilla.org/en-US/docs/Web/CSS/justify-content) |
| id             | string                | No       | Optional unique identifier for the component.                                                        |

### Property values

| Type                  | Value                                                                          | Description                                                                                     |
| --------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| NubeChildrenComponent | NubeComponent<br/>NubeComponent[]                                              | Defines possible alignment values for flex container content.                                   |
| FlexContent           | "start"<br/>"center"<br/>"space-between"<br/>"space-around"<br/>"space-evenly" | Defines possible alignment values for flex container content.                                   |
| FlexItems             | "start"<br/>"center"<br/>"end"<br/>"stretch";                                  | Defines possible alignment values for flex items.                                               |
| SizeUnit              | "em"<br/>"rem"<br/>"px"<br/>"%"                                                | Defines units for size measurements.                                                            |
| Size                  | `${number}${SizeUnit}`<br/>number<br/>"auto"                                   | Represents a flexible size definition.<br/>It can be a number, a string with a unit, or "auto". |
