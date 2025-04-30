---
title: Textarea Component
---

# Textarea

A `textarea` represents a multi-line text input field that allows users to enter longer texts.
It supports properties such as `name`, `label`, and event handlers (`onChange`, `onBlur`, `onFocus`).

## Usage

::: code-group

```tsx [JSX]
import { Textarea } from "@tiendanube/nube-sdk-jsx";

<Textarea
  name="description"
  label="Description"
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
  maxLength: 500,
  rows: 4,
  onChange: () => {},
  onBlur: () => {},
  onFocus: () => {},
});
```

:::

### Event Handlers

The textarea component supports three event handlers that receive an object with the following properties:

```typescript
onChange: (data: {
  type: "change";       // The type of event
  state: NubeSDKState;  // The current state of the SDK
  value?: string;       // The new value of the textarea
}) => void

onBlur: (data: {
  type: "blur";         // The type of event
  state: NubeSDKState;  // The current state of the SDK
  value?: string;       // The current value of the textarea
}) => void

onFocus: (data: {
  type: "focus";        // The type of event
  state: NubeSDKState;  // The current state of the SDK
  value?: string;       // The current value of the textarea
}) => void
```

Example usage:

::: code-group

```tsx [JSX]
import { Textarea } from "@tiendanube/nube-sdk-jsx";
import type { NubeComponentTextareaEventHandler } from "@tiendanube/nube-sdk-types";

const handleEvents: NubeComponentTextareaEventHandler = (event) => {
  const { type, value, state } = event;
  // Perform some action
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
  // Perform some action
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

:::

## Properties

| Property  | Type                              | Required | Description                                                   |
| --------- | --------------------------------- | -------- | ------------------------------------------------------------- |
| name      | string                            | Yes      | The name of the textarea, used to identify it in forms.       |
| label     | string                            | Yes      | The label text displayed above the textarea.                  |
| value     | string                            | No       | The current value of the textarea.                            |
| maxLength | number                            | No       | The maximum number of characters allowed in the textarea.     |
| rows      | number                            | No       | The number of visible text lines in the textarea.             |
| onChange  | NubeComponentTextareaEventHandler | No       | Function called when the textarea value changes.              |
| onBlur    | NubeComponentTextareaEventHandler | No       | Function called when the textarea loses focus.                |
| onFocus   | NubeComponentTextareaEventHandler | No       | Function called when the textarea receives focus.             |

### Property values

| Type                              | Value                                                                                                         | Description                              |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| NubeComponentTextareaEventHandler | (data: {<br/>type: "change" \| "blur" \| "focus";<br/>state: NubeSDKState;<br/>value?: string;<br/>}) => void | Textarea event handler function.         |
