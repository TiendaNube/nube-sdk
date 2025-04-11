---
title: Column Component
---

# Column

A `column` is a flexible horizontal container used to align child components in a column.
It inherits all the capabilities of the [box component](/docs/components/box), with the direction property preset to `"column"`.

## Usage

::: code-group

```tsx [JSX]
import { Column } from "@tiendanube/nube-sdk-jsx";

<Column width={100} height={200}>
  {/* children */}
</Column>;
```

```typescript [Declarative]
import { column } from "@tiendanube/nube-sdk-ui";

column({
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
| children       | NubeChildrenComponent | No       | Array of child components nested inside the column.                                                  |
| width          | Size                  | No       | Width of the column (e.g., "100%", "200px").                                                         |
| height         | Size                  | No       | Height of the column.                                                                                |
| margin         | Size                  | No       | Outer spacing around the column.                                                                     |
| padding        | Size                  | No       | Inner spacing of the column (e.g., "16px").                                                          |
| gap            | Size                  | No       | Spacing between child elements (e.g., "1rem").                                                       |
| borderRadius   | Size                  | No       | Border radius of the column (e.g., "8px").                                                           |
| reverse        | boolean               | No       | Whether children should wrap to the next line when space runs out.                                   |
| background     | string                | No       | Background color (can be CSS variable like "var(--primary-color)").                                  |
| color          | string                | No       | Content color (can be CSS variable like "var(--primary-color)").                                     |
| alignItems     | FlexItems             | No       | The CSS property [align-items](https://developer.mozilla.org/en-US/docs/Web/CSS/align-items)         |
| alignContent   | FlexContent           | No       | The CSS property [align-content](https://developer.mozilla.org/en-US/docs/Web/CSS/align-content)     |
| justifyContent | FlexContent           | No       | The CSS property [justify-content](https://developer.mozilla.org/en-US/docs/Web/CSS/justify-content) |
| id             | string                | No       | Optional unique identifier for the component.                                                        |

### Property values

| Type                  | Value                                                                          | Description                                                                                     |
| --------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| NubeChildrenComponent | NubeComponent<br/>NubeComponent[]                                              | Defines possible alignment values for flex container content.                                   |
| FlexContent           | "start"<br/>"center"<br/>"space-between"<br/>"space-around"<br/>"space-evenly" | Defines possible alignment values for flex container content.                                   |
| FlexItems             | "start"<br/>"center"<br/>"end"<br/>"stretch";                                  | Defines possible alignment values for flex items.                                               |
| SizeUnit              | "em"<br/>"rem"<br/>"px"<br/>"%"                                                | Defines units for size measurements.                                                            |
| Size                  | `${number}${SizeUnit}`<br/>number<br/>"auto"                                   | Represents a flexible size definition.<br/>It can be a number, a string with a unit, or "auto". |
