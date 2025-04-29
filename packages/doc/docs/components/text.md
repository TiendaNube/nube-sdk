---
title: Text Component
---

# Text

The `text` component is used to render text with optional styling.
It supports properties such as `color`, `background`, `heading` levels (h1-h6),
text formatting `modifiers` (bold, italic, etc.), and inline display.

## Usage

::: code-group

```tsx [JSX]
import { Text } from "@tiendanube/nube-sdk-jsx";

<Text>Hello World</Text>;
```

```typescript [Declarative]
import { text } from "@tiendanube/nube-sdk-ui";

text({
  text: "Hello World",
});
```

:::

## Properties

| Property   | Type                         | Required | Description                                                             |
| ---------- | ---------------------------- | -------- | ----------------------------------------------------------------------- |
| text       | string                       | Yes      | The text content to be displayed.                                       |
| color      | string                       | No       | The text color (can be CSS variable like "var(--primary-color)").       |
| background | string                       | No       | The background color (can be CSS variable like "var(--primary-color)"). |
| heading    | 1\|2\|3\|4\|5\|6             | No       | The heading level (h1-h6).                                              |
| modifiers  | TxtModifier[]                | No       | Array of text formatting modifiers.                                     |
| inline     | boolean                      | No       | Whether the text should be displayed inline.                            |

### Property values

| Type        | Value                                                                                             | Description                                 |
| ----------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| TxtModifier | "bold"<br/>"italic"<br/>"underline"<br/>"strike"<br/>"lowercase"<br/>"uppercase"<br/>"capitalize" | Defines possible text formatting modifiers. |
