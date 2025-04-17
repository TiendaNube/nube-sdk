---
title: Button Component
---

# Button

A `button` is a clickable element used to trigger actions.
It supports properties such as text, onClick, and style configurations.

## Usage

::: code-group

```tsx [JSX]
import { Button } from "@tiendanube/nube-sdk-jsx";

<Button variant="primary" onClick={() => {}}>
  Click here
</Button>;
```

```typescript [Declarative]
import { button } from "@tiendanube/nube-sdk-ui";

button({
  children: "Click here",
  variant: "primary",
  onClick: () => {},
});
```

:::

### onClick Handler

The `onClick` handler receives an object with the following properties:

```typescript
onClick: (data: {
  type: "click";           // The type of event
  state: NubeSDKState;     // The current state of the SDK
}) => void
```

Example usage:

::: code-group

```tsx [JSX]
import { Button } from "@tiendanube/nube-sdk-jsx";

<Button onClick={({ state }) => {
  // Access the current state
  console.log(state);
  // Perform some action
}}>
  Click here
</Button>;
```

```typescript [Declarative]
import { button } from "@tiendanube/nube-sdk-ui";

button({
  children: "Click here",
  onClick: ({ state }) => {
    // Access the current state
    console.log(state);
    // Perform some action
  }
});
```

:::

## Properties

| Property | Type                                                   | Required | Description                                  |
| -------- | ------------------------------------------------------ | -------- | -------------------------------------------- |
| children | string                                                 | No       | Text or content of the button.               |
| disabled | boolean                                                | No       | Whether the button is disabled.              |
| variant  | "primary"<br/>"secondary"<br/>"transparent"<br/>"link" | No       | Button style variant.                        |
| width    | Size                                                   | No       | Width of the button (e.g., "100%", "200px"). |
| height   | Size                                                   | No       | Height of the button.                        |
| onClick  | NubeComponentButtonEventHandler                        | No       | Function called when the button is clicked.  |

### Property values

| Type                            | Value                                                   | Description                                                                              |
| ------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Size                            | `${number}${SizeUnit}`<br/>number<br/>"auto"              | Represents a flexible size definition. Can be a number, a string with a unit, or "auto". |
| SizeUnit                        | "em"<br/>"rem"<br/>"px"<br/>"%"                            | Defines units for size measurements.                                                     |
| NubeComponentButtonEventHandler | (data: {<br/>type: "click";<br/>state: NubeSDKState;<br/>}) => void | Button event handler function.                                                           |
