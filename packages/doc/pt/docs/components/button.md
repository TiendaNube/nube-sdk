---
title: Button Component
---

# Button

Um `button` é um elemento clicável usado para acionar ações.
Ele suporta propriedades como texto, onClick e configurações de estilo.

## Uso

::: code-group

```tsx [JSX]
import { Button } from "@tiendanube/nube-sdk-jsx";

<Button variant="primary" onClick={() => {}}>
  Clique aqui
</Button>;
```

```typescript [Declarativo]
import { button } from "@tiendanube/nube-sdk-ui";

button({
  children: "Clique aqui",
  variant: "primary",
  onClick: () => {},
});
```

:::

### Manipulador onClick

O manipulador `onClick` recebe um objeto com as seguintes propriedades:

```typescript
onClick: (data: {
  type: "click";           // O tipo do evento
  state: NubeSDKState;     // O estado atual do SDK
}) => void
```

Exemplo de uso:

::: code-group

```tsx [JSX]
import { Button } from "@tiendanube/nube-sdk-jsx";

<Button onClick={({ state }) => {
  // Acessar o estado atual
  console.log(state);
  // Executar alguma ação
}}>
  Clique aqui
</Button>;
```

```typescript [Declarativo]
import { button } from "@tiendanube/nube-sdk-ui";

button({
  children: "Clique aqui",
  onClick: ({ state }) => {
    // Acessar o estado atual
    console.log(state);
    // Executar alguma ação
  }
});
```

:::

## Propriedades

| Propriedade | Tipo                                                | Obrigatório | Descrição                                  |
| ----------- | --------------------------------------------------- | ----------- | ------------------------------------------ |
| children    | string                                              | Não         | Texto ou conteúdo do botão.                |
| disabled    | boolean                                             | Não         | Se o botão está desabilitado.              |
| variant     | "primary" \| "secondary" \| "transparent" \| "link" | Não         | Variante de estilo do botão.               |
| width       | Size                                                | Não         | Largura do botão (ex: "100%", "200px").    |
| height      | Size                                                | Não         | Altura do botão.                           |
| onClick     | NubeComponentButtonEventHandler                     | Não         | Função chamada quando o botão é clicado.   |

### Valores das propriedades

| Tipo                            | Valor                                                   | Descrição                                                                              |
| ------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Size                            | `${number}${SizeUnit}` \| number \| "auto"              | Representa uma definição de tamanho flexível. Pode ser um número, uma string com unidade ou "auto". |
| SizeUnit                        | "em" \| "rem" \| "px" \| "%"                            | Define unidades para medidas de tamanho.                                               |
| NubeComponentButtonEventHandler | (data: { type: "click"; state: NubeSDKState; }) => void | Função de manipulação de eventos do botão.                                             |
