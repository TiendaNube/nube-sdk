---
title: Field Component
---

# Field

Um `field` representa um elemento de entrada de texto em um formulário.
Ele suporta propriedades como `name`, `label` e manipuladores de eventos (`onChange`, `onBlur`, `onFocus`).

## Uso

::: code-group

```tsx [JSX]
import { Field } from "@tiendanube/nube-sdk-jsx";

<Field
  name="email"
  label="Email"
  onChange={() => {}}
  onBlur={() => {}}
  onFocus={() => {}}
/>;
```

```typescript [Declarative]
import { field } from "@tiendanube/nube-sdk-ui";

field({
  name: "email",
  label: "Email",
  onChange: () => {},
  onBlur: () => {},
  onFocus: () => {},
});
```

:::

### Manipulador de Eventos

O componente field suporta três manipuladores de eventos que recebem um objeto com as seguintes propriedades:

```typescript
onChange: (data: {
  type: "change";       // O tipo do evento
  state: NubeSDKState;  // O estado atual do SDK
  value?: string;       // O novo valor do campo
}) => void

onBlur: (data: {
  type: "blur";         // O tipo do evento
  state: NubeSDKState;  // O estado atual do SDK
  value?: string;       // O valor atual do campo
}) => void

onFocus: (data: {
  type: "focus";        // O tipo do evento
  state: NubeSDKState;  // O estado atual do SDK
  value?: string;       // O valor atual do campo
}) => void
```

Example usage:

::: code-group

```tsx [JSX]
import { Field } from "@tiendanube/nube-sdk-jsx";
import type { NubeComponentFieldEventHandler } from "@tiendanube/nube-sdk-types";

const handleEvents: NubeComponentFieldEventHandler = (event) => {
  const { type, value, state } = event;
  // Executar alguma ação
};

<Field
  name="email"
  label="Email"
  value="example@example.com"
  onChange={handleEvents}
  onBlur={handleEvents}
  onFocus={handleEvents}
/>;
```

```typescript [Declarative]
import { field } from "@tiendanube/nube-sdk-ui";
import type { NubeComponentFieldEventHandler } from "@tiendanube/nube-sdk-types";

const handleEvents: NubeComponentFieldEventHandler = (event) => {
  const { type, value, state } = event;
  // Executar alguma ação
};

field({
  name: "email",
  label: "Email",
  value: "example@example.com",
  onChange: handleEvents,
  onBlur: handleEvents,
  onFocus: handleEvents,
});
```

:::

## Propriedades

| Propriedade | Tipo                           | Obrigatório | Descrição                                                 |
| ----------- | ------------------------------ | ----------- | --------------------------------------------------------- |
| name        | string                         | Sim         | O nome do campo, usado para identificá-lo em formulários. |
| label       | string                         | Sim         | O texto do rótulo exibido acima do campo.                 |
| value       | string                         | Não         | O valor atual do campo de entrada.                        |
| onChange    | NubeComponentFieldEventHandler | Não         | Função chamada quando o valor do campo muda.              |
| onBlur      | NubeComponentFieldEventHandler | Não         | Função chamada quando o campo perde o foco.               |
| onFocus     | NubeComponentFieldEventHandler | Não         | Função chamada quando o campo recebe o foco.              |

### Valores das propriedades

| Tipo                           | Valor                                                                                                     | Descrição                                |
| ------------------------------ | --------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| NubeComponentFieldEventHandler | (data: {<br/>type: "change" \| "blur" \| "focus"; state: NubeSDKState;<br/>value?: string;<br/>}) => void | Função manipuladora de eventos do campo. |
