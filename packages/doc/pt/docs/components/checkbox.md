---
title: Checkbox Component
---

# Checkbox

Um `checkbox` representa um campo selecionável que pode ser alternado entre estados marcado e desmarcado.
É tipicamente usado para permitir que os usuários selecionem uma ou mais opções.
Suporta propriedades como `name`, `label`, `checked` e manipuladores de eventos (`onChange`).

## Usage

::: code-group

```tsx [JSX]
import { Checkbox } from "@tiendanube/nube-sdk-jsx";

<Checkbox
  name="terms"
  label="I agree to the terms and conditions"
  checked={false}
  onChange={() => {}}
/>;
```

```typescript [Declarative]
import { checkbox } from "@tiendanube/nube-sdk-ui";

checkbox({
  name: "terms",
  label: "I agree to the terms and conditions",
  checked: false,
  onChange: () => {},
});
```

:::

### Event Handlers

O componente checkbox suporta um manipulador de eventos que recebe um objeto com as seguintes propriedades:

```typescript
onChange: (data: {
  type: "change";       // O tipo do evento
  state: NubeSDKState;  // O estado atual do SDK
  value?: boolean;      // O novo estado marcado do checkbox
}) => void
```

Example usage:

::: code-group

```tsx [JSX]
import { Checkbox } from "@tiendanube/nube-sdk-jsx";
import type { NubeComponentCheckEventHandler } from "@tiendanube/nube-sdk-types";

const handleEvents: NubeComponentCheckEventHandler = (event) => {
  const { type, value, state } = event;
  // Executar alguma ação
};

<Checkbox
  name="terms"
  label="I agree to the terms and conditions"
  checked={false}
  onChange={handleEvents}
/>;
```

```typescript [Declarative]
import { checkbox } from "@tiendanube/nube-sdk-ui";
import type { NubeComponentCheckEventHandler } from "@tiendanube/nube-sdk-types";

const handleEvents: NubeComponentCheckEventHandler = (event) => {
  const { type, value, state } = event;
  // Executar alguma ação
};

checkbox({
  name: "terms",
  label: "I agree to the terms and conditions",
  checked: false,
  onChange: handleEvents,
});
```

:::

## Properties

| Property | Type                           | Required | Description                                                   |
| -------- | ------------------------------ | -------- | ------------------------------------------------------------- |
| name     | string                         | Yes      | O nome do checkbox, usado para identificá-lo em formulários.  |
| label    | string                         | Yes      | O texto do rótulo exibido ao lado do checkbox.                |
| checked  | boolean                        | Yes      | O estado atual marcado do checkbox.                           |
| onChange | NubeComponentCheckEventHandler | No       | Função chamada quando o estado do checkbox muda.              |

### Property values

| Type                           | Value                                                                                 | Description                                 |
| ------------------------------ | ------------------------------------------------------------------------------------- | ------------------------------------------- |
| NubeComponentCheckEventHandler | (data: {<br/>type: "change"; state: NubeSDKState;<br/>value?: boolean;<br/>}) => void | Função manipuladora de eventos do checkbox. |
