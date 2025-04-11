---
title: Row Component
---

# Row

Um `row` é um container flexível usado para estruturar layouts na direção horizontal.
Ele herda a maioria das propriedades do `box`, exceto pela propriedade `direction`.

## Usage

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

## Properties

| Property | Type                         | Required | Description                                                   |
| -------- | ---------------------------- | -------- | ------------------------------------------------------------- |
| children | NubeComponent[]              | No       | Os componentes filhos que serão renderizados dentro da linha. |
| gap      | string                       | No       | O espaçamento entre os elementos filhos.                      |
| padding  | string                       | No       | O preenchimento interno da linha.                             |
| width    | string                       | No       | A largura da linha.                                           |
| height   | string                       | No       | A altura da linha.                                            |
| align    | "start" \| "center" \| "end" | No       | O alinhamento horizontal dos elementos filhos.                |

## Additional Properties

| Property       | Type                  | Required | Description                                                                                          |
| -------------- | --------------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| reverse        | boolean               | No       | Se os filhos devem quebrar para a próxima linha quando o espaço acabar.                              |
| background     | string                | No       | Cor de fundo (pode ser uma variável CSS como "var(--primary-color)").                               |
| color          | string                | No       | Cor do conteúdo (pode ser uma variável CSS como "var(--primary-color)").                            |
| alignItems     | FlexItems             | No       | A propriedade CSS [align-items](https://developer.mozilla.org/en-US/docs/Web/CSS/align-items)       |
| alignContent   | FlexContent           | No       | A propriedade CSS [align-content](https://developer.mozilla.org/en-US/docs/Web/CSS/align-content)   |
| justifyContent | FlexContent           | No       | A propriedade CSS [justify-content](https://developer.mozilla.org/en-US/docs/Web/CSS/justify-content) |
| id             | string                | No       | Identificador único opcional para o componente.                                                      |

### Property values

| Type                  | Value                                                                          | Description                                                                                     |
| --------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| NubeChildrenComponent | NubeComponent<br/>NubeComponent[]                                              | Define os valores possíveis de alinhamento para o conteúdo do container flexível.               |
| FlexContent           | "start"<br/>"center"<br/>"space-between"<br/>"space-around"<br/>"space-evenly" | Define os valores possíveis de alinhamento para o conteúdo do container flexível.               |
| FlexItems             | "start"<br/>"center"<br/>"end"<br/>"stretch";                                  | Define os valores possíveis de alinhamento para os itens flexíveis.                             |
| SizeUnit              | "em"<br/>"rem"<br/>"px"<br/>"%"                                                | Define as unidades para medições de tamanho.                                                    |
| Size                  | `${number}${SizeUnit}`<br/>number<br/>"auto"                                   | Representa uma definição de tamanho flexível.<br/>Pode ser um número, uma string com unidade ou "auto". |
