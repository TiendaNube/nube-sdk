---
title: Row Component
---

# Row

Um `row` é um container flexível usado para estruturar layouts na direção horizontal.
Ele herda a maioria das propriedades do `box`, exceto pela propriedade `direction`.

## Uso

::: code-group

```tsx [JSX]
import { Row } from "@tiendanube/nube-sdk-jsx";

<Row>
  <Text>Conteúdo da linha</Text>
</Row>;
```

```typescript [Declarative]
import { row } from "@tiendanube/nube-sdk-ui";

row({
  children: [
    {
      type: "text",
      text: "Conteúdo da linha",
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
