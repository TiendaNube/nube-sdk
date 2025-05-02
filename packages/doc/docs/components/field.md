---
title: Field Component
---

# Field

A `field` represents a text input element in a form.
It supports properties like `name`, `label`, and event handlers (`onChange`, `onBlur`, `onFocus`).

## Usage

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

### Event Handlers

The field component supports three event handlers that receive an object with the following properties:

```typescript
onChange: (data: {
  type: "change";       // The type of event
  state: NubeSDKState;  // The current state of the SDK
  value?: string;       // The new value of the field
}) => void

onBlur: (data: {
  type: "blur";         // The type of event
  state: NubeSDKState;  // The current state of the SDK
  value?: string;       // The current value of the field
}) => void

onFocus: (data: {
  type: "focus";        // The type of event
  state: NubeSDKState;  // The current state of the SDK
  value?: string;       // The current value of the field
}) => void
```

Example usage:

::: code-group

```tsx [JSX]
import { Field } from "@tiendanube/nube-sdk-jsx";
import type { NubeComponentFieldEventHandler } from "@tiendanube/nube-sdk-types";

const handleEvents: NubeComponentFieldEventHandler = (event) => {
  const { type, value, state } = event;
  // Perform some action 
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
  // Perform some action 
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

## Properties

| Property | Type                           | Required | Description                                          |
| -------- | ------------------------------ | -------- | ---------------------------------------------------- |
| name     | string                         | Yes      | The name of the field, used to identify it in forms. |
| label    | string                         | Yes      | The label text displayed above the field.            |
| value    | string                         | No       | The current value of the field input.                |
| onChange | NubeComponentFieldEventHandler | No       | Function called when the field value changes.        |
| onBlur   | NubeComponentFieldEventHandler | No       | Function called when the field loses focus.          |
| onFocus  | NubeComponentFieldEventHandler | No       | Function called when the field receives focus.       |

### Property values

| Type                           | Value                                                                                                     | Description                   |
| ------------------------------ | --------------------------------------------------------------------------------------------------------- | ----------------------------- |
| NubeComponentFieldEventHandler | (data: {<br/>type: "change" \| "blur" \| "focus"; state: NubeSDKState;<br/>value?: string;<br/>}) => void | Field event handler function. |
