---
title: Fragment Component
---

# Fragment

O `fragment` é um componente utilitário que serve como um elemento de agrupamento lógico.
Ele permite que múltiplos componentes sejam agrupados sem introduzir um nó DOM adicional.
Isso é particularmente útil quando você precisa retornar múltiplos elementos de um componente
sem adicionar elementos de encapsulamento desnecessários ao DOM.

## Uso

::: code-group

```tsx [JSX]
import { Fragment } from "@tiendanube/nube-sdk-jsx";

<Fragment>
  <Text>Primeiro elemento</Text>
  <Text>Segundo elemento</Text>
</Fragment>;
```

```typescript [Declarative]
import { fragment } from "@tiendanube/nube-sdk-ui";

fragment({
  children: [
    {
      type: "text",
      text: "Primeiro elemento",
    },
    {
      type: "text",
      text: "Segundo elemento",
    },
  ],
});
```

:::

## Propriedades

| Propriedade | Tipo            | Obrigatório | Descrição                                |
| ----------- | --------------- | ----------- | ---------------------------------------- |
| children    | NubeComponent[] | Não         | Os componentes filhos a serem agrupados. |

## Quando Usar

- Quando você precisa retornar múltiplos elementos de um componente
- Quando você quer agrupar elementos sem adicionar nós DOM extras
- Quando você precisa manter uma estrutura DOM limpa
- Quando trabalhar com listas ou renderização condicional
