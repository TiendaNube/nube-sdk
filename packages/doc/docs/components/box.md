---
title: Box Component
---

# Box

A `box` is a flexible container that can be used for layout purposes.
It supports properties like width, height, padding, margin, and flex-based alignment.

## Usage

::: code-group

```tsx [JSX]
import { Box } from "@tiendanube/nube-sdk-jsx";

<Box width={100} height={200}>
  {/* children */}
</Box>;
```

```typescript [Declarative]
import { box } from "@tiendanube/nube-sdk-ui";

box({
  width: 100,
  height: 200,
  children: [
    /* children */
  ],
});
```

:::

## Properties

| Property       | Type                  | Required | Description                                                                                          |
| -------------- | --------------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| children       | NubeChildrenComponent | No       | Array of child components nested inside the box.                                                     |
| width          | Size                  | No       | Width of the box (e.g., "100%", "200px").                                                            |
| height         | Size                  | No       | Height of the box.                                                                                   |
| margin         | Size                  | No       | Outer spacing around the box.                                                                        |
| padding        | Size                  | No       | Inner spacing of the box (e.g., "16px").                                                             |
| gap            | Size                  | No       | Spacing between child elements (e.g., "1rem").                                                       |
| borderRadius   | Size                  | No       | Border radius of the box (e.g., "8px").                                                              |
| reverse        | boolean               | No       | Whether children should wrap to the next line when space runs out.                                   |
| background     | string                | No       | Background color (can be CSS variable like "var(--primary-color)").                                  |
| color          | string                | No       | Content color (can be CSS variable like "var(--primary-color)").                                     |
| alignItems     | FlexItems             | No       | The CSS property [align-items](https://developer.mozilla.org/en-US/docs/Web/CSS/align-items)         |
| alignContent   | FlexContent           | No       | The CSS property [align-content](https://developer.mozilla.org/en-US/docs/Web/CSS/align-content)     |
| justifyContent | FlexContent           | No       | The CSS property [justify-content](https://developer.mozilla.org/en-US/docs/Web/CSS/justify-content) |
| direction      | "row"<br/>"column"    | No       | Layout direction for children (row for horizontal, column for vertical).                             |
| id             | string                | No       | Optional unique identifier for the component.                                                        |

### Property values

| Type                  | Value                                                                          | Description                                                                                     |
| --------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| NubeChildrenComponent | NubeComponent<br/>NubeComponent[]                                              | Defines possible alignment values for flex container content.                                   |
| FlexContent           | "start"<br/>"center"<br/>"space-between"<br/>"space-around"<br/>"space-evenly" | Defines possible alignment values for flex container content.                                   |
| FlexItems             | "start"<br/>"center"<br/>"end"<br/>"stretch";                                  | Defines possible alignment values for flex items.                                               |
| SizeUnit              | "em"<br/>"rem"<br/>"px"<br/>"%"                                                | Defines units for size measurements.                                                            |
| Size                  | `${number}${SizeUnit}`<br/>number<br/>"auto"                                   | Represents a flexible size definition.<br/>It can be a number, a string with a unit, or "auto". |
