---
title: Box Component
---

# Box

Um `box` é um container flexível que pode ser usado para fins de layout.
Ele suporta propriedades como largura, altura, preenchimento, margem e alinhamento baseado em flex.

## Uso

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

## Propriedades

| Propriedade    | Tipo                           | Obrigatório | Descrição                                                                                            |
| -------------- | ------------------------------ | ----------- | ---------------------------------------------------------------------------------------------------- |
| children       | NubeComponent[]                | Não         | Os componentes filhos que serão renderizados dentro do box.                                          |
| gap            | string                         | Não         | O espaçamento entre os elementos filhos.                                                             |
| padding        | string                         | Não         | O preenchimento interno do box.                                                                      |
| margin         | string                         | Não         | A margem externa do box.                                                                             |
| width          | string                         | Não         | A largura do box.                                                                                    |
| height         | string                         | Não         | A altura do box.                                                                                     |
| align          | "start"<br/>"center"<br/>"end" | Não         | O alinhamento dos elementos filhos.                                                                  |
| direction      | "row"<br/>"column"             | Não         | A direção do layout flexível (horizontal ou vertical).                                               |
| reverse        | boolean                        | Não         | Whether children should wrap to the next line when space runs out.                                   |
| background     | string                         | Não         | Background color (can be CSS variable like "var(--primary-color)").                                  |
| color          | string                         | Não         | Content color (can be CSS variable like "var(--primary-color)").                                     |
| alignItems     | FlexItems                      | Não         | The CSS property [align-items](https://developer.mozilla.org/en-US/docs/Web/CSS/align-items)         |
| alignContent   | FlexContent                    | Não         | The CSS property [align-content](https://developer.mozilla.org/en-US/docs/Web/CSS/align-content)     |
| justifyContent | FlexContent                    | Não         | The CSS property [justify-content](https://developer.mozilla.org/en-US/docs/Web/CSS/justify-content) |
| id             | string                         | Não         | Optional unique identifier for the component.                                                        |

### Valores das propriedades

| Tipo                  | Valor                                                                          | Descrição                                                                                       |
| --------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| NubeChildrenComponent | NubeComponent<br/>NubeComponent[]                                              | Defines possible alignment values for flex container content.                                   |
| FlexContent           | "start"<br/>"center"<br/>"space-between"<br/>"space-around"<br/>"space-evenly" | Defines possible alignment values for flex container content.                                   |
| FlexItems             | "start"<br/>"center"<br/>"end"<br/>"stretch";                                  | Defines possible alignment values for flex items.                                               |
| SizeUnit              | "em"<br/>"rem"<br/>"px"<br/>"%"                                                | Defines units for size measurements.                                                            |
| Size                  | `${number}${SizeUnit}`<br/>number<br/>"auto"                                   | Represents a flexible size definition.<br/>It can be a number, a string with a unit, or "auto". |
