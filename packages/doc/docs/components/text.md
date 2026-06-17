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
| showCopyButton | boolean                  | No       | Renders a copy button that copies the text content to the clipboard.    |

### Styling the copy button

When `showCopyButton` is enabled, the copy icon exposes a `data-clipboard-state`
attribute that reflects its state, so it can be styled per state via CSS:

- `data-clipboard-state="idle"` — default (copy icon).
- `data-clipboard-state="copied"` — right after a successful copy (check icon).

### Property values

| Type        | Value                                                                                             | Description                                 |
| ----------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| TxtModifier | "bold"<br/>"italic"<br/>"underline"<br/>"strike"<br/>"lowercase"<br/>"uppercase"<br/>"capitalize" | Defines possible text formatting modifiers. |
