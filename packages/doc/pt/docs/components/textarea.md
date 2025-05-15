---
title: Textarea Component
---

# Textarea

Um `textarea` representa um campo de entrada de texto multilinha que permite aos usuários inserir textos mais longos.
Ele suporta propriedades como `name`, `label` e manipuladores de eventos (`onChange`, `onBlur`, `onFocus`).

## Usage

::: code-group

```tsx [JSX]
import { Textarea } from "@tiendanube/nube-sdk-jsx";

<Textarea
  name="description"
  label="Description"
  value="example@example.com"
  maxLength={500}
  rows={4}
  onChange={() => {}}
  onBlur={() => {}}
  onFocus={() => {}}
/>;
```

```typescript [Declarative]
import { textarea } from "@tiendanube/nube-sdk-ui";

textarea({
  name: "description",
  label: "Description",
  value: "example@example.com",
  maxLength: 500,
  rows: 4,
  onChange: () => {},
  onBlur: () => {},
  onFocus: () => {},
});
```

:::

### Manipulador de Eventos

O componente textarea suporta três manipuladores de eventos que recebem um objeto com as seguintes propriedades:

```typescript
onChange: (data: {
  type: "change";       // O tipo do evento
  state: NubeSDKState;  // O estado atual do SDK
  value?: string;       // O novo valor do textarea
}) => void

onBlur: (data: {
  type: "blur";         // O tipo do evento
  state: NubeSDKState;  // O estado atual do SDK
  value?: string;       // O valor atual do textarea
}) => void

onFocus: (data: {
  type: "focus";        // O tipo do evento
  state: NubeSDKState;  // O estado atual do SDK
  value?: string;       // O valor atual do textarea
}) => void
```

Example usage:

::: code-group

```tsx [JSX]
import { Textarea } from "@tiendanube/nube-sdk-jsx";
import type { NubeComponentTextareaEventHandler } from "@tiendanube/nube-sdk-types";

const handleEvents: NubeComponentTextareaEventHandler = (event) => {
  const { type, value, state } = event;
  // Executar alguma ação
};

<Textarea
  name="description"
  label="Description"
  value="example@example.com"
  maxLength={500}
  rows={4}
  onChange={handleEvents}
  onBlur={handleEvents}
  onFocus={handleEvents}
/>;
```

```typescript [Declarative]
import { textarea } from "@tiendanube/nube-sdk-ui";
import type { NubeComponentTextareaEventHandler } from "@tiendanube/nube-sdk-types";

const handleEvents: NubeComponentTextareaEventHandler = (event) => {
  const { type, value, state } = event;
  // Executar alguma ação
};

textarea({
  name: "description",
  label: "Description",
  value: "example@example.com",
  maxLength: 500,
  rows: 4,
  onChange: handleEvents,
  onBlur: handleEvents,
  onFocus: handleEvents,
});
```

## Properties

| Property  | Type                              | Required | Description                                                            |
| --------- | --------------------------------- | -------- | -----------------------------------------------------------------------|
| name      | string                            | Yes      | O nome do textarea, usado para identificá-lo em formulários.           |
| label     | string                            | Yes      | O texto do rótulo exibido acima do textarea.                           |
| value     | string                            | No       | O valor atual do textarea.                                             |
| maxLength | number                            | No       | O número máximo de caracteres permitidos no textarea.                  |
| rows      | number                            | No       | O número de linhas de texto visíveis no textarea.                      |
| autoFocus | boolean                           | No       | Se o textarea deve receber foco automaticamente quando montado.        |
| onChange  | NubeComponentTextareaEventHandler | No       | Função chamada quando o valor do textarea muda.                        |
| onBlur    | NubeComponentTextareaEventHandler | No       | Função chamada quando o textarea perde o foco.                         |
| onFocus   | NubeComponentTextareaEventHandler | No       | Função chamada quando o textarea recebe foco.                          |

### Property values

| Type                              | Value                                                                                                         | Description                              |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| NubeComponentTextareaEventHandler | (data: {<br/>type: "change" \| "blur" \| "focus";<br/>state: NubeSDKState;<br/>value?: string;<br/>}) => void | Função manipuladora de eventos do textarea. |