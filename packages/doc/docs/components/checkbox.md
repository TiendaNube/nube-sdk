---
title: Checkbox Component
---

# Checkbox

A `checkbox` represents a selectable field that can be toggled between checked and unchecked states.
It is typically used to allow users to select one or more options.
Supports properties such as `name`, `label`, `checked`, and event handlers (`onChange`).

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

The checkbox component supports an event handler that receives an object with the following properties:

```typescript
onChange: (data: {
  type: "change";       // The type of event
  state: NubeSDKState;  // The current state of the SDK
  value?: boolean;      // The new checked state of the checkbox
}) => void
```

Example usage:

::: code-group

```tsx [JSX]
import { Checkbox } from "@tiendanube/nube-sdk-jsx";
import type { NubeComponentCheckEventHandler } from "@tiendanube/nube-sdk-types";

const handleEvents: NubeComponentCheckEventHandler = (event) => {
  const { type, value, state } = event;
  // Perform some action
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
  // Perform some action
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
| name     | string                         | Yes      | The name of the checkbox, used to identify it in forms.       |
| label    | string                         | Yes      | The label text displayed next to the checkbox.                |
| checked  | boolean                        | Yes      | The current checked state of the checkbox.                    |
| onChange | NubeComponentCheckEventHandler | No       | Function called when the checkbox state changes.              |

### Property values

| Type                           | Value                                                                                 | Description                              |
| ------------------------------ | ------------------------------------------------------------------------------------- | ---------------------------------------- |
| NubeComponentCheckEventHandler | (data: {<br/>type: "change"; state: NubeSDKState;<br/>value?: boolean;<br/>}) => void | Checkbox event handler function.         |
