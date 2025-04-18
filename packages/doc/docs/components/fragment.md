---
title: Fragment Component
---

# Fragment

The `fragment` is a utility component that serves as a logical grouping element.
It allows multiple components to be wrapped together without introducing an additional DOM node.
This is particularly useful when you need to return multiple elements from a component
without adding unnecessary wrapper elements to the DOM.

## Usage

::: code-group

```tsx [JSX]
import { Fragment } from "@tiendanube/nube-sdk-jsx";

<Fragment>
  <Text>First element</Text>
  <Text>Second element</Text>
</Fragment>;
```

```typescript [Declarative]
import { fragment } from "@tiendanube/nube-sdk-ui";

fragment({
  children: [
    {
      type: "text",
      text: "First element",
    },
    {
      type: "text",
      text: "Second element",
    },
  ],
});
```

:::

## Properties

| Property | Type              | Required | Description                                                   |
| -------- | ----------------- | -------- | ------------------------------------------------------------- |
| children | NubeComponent[]   | No       | The child components to be grouped together.                  |

## When to Use

- When you need to return multiple elements from a component
- When you want to group elements without adding extra DOM nodes
- When you need to maintain a clean DOM structure
- When working with lists or conditional rendering
