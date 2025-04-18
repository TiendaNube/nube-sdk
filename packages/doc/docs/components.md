---
title: Components
cards:
  - title: Box
    link: /docs/components/box
    description: A flexible container that can be used for layout purposes. It supports properties like width, height, padding, margin, and flex-based alignment.
  - title: Button
    link: /docs/components/button
    description: A clickable element typically used to trigger an action or submit a form. It supports properties such as `text`, `onClick`, and style configurations.
  - title: Checkbox
    link: /docs/components/checkbox
    description: A selectable field that can be toggled between checked and unchecked states. It is typically used to allow users to select one or more options.
  - title: Column
    link: /docs/components/column
    description: A `column` is a flexible column container that can be used for structuring layouts. It inherits most properties from `box`, except for the `direction` property.
  - title: Field
    link: /docs/components/field
    description: An input element in a form, such as text fields, dropdowns, or checkboxes. It supports properties like `name`, `label`, and event handlers (`onChange`, `onBlur`, `onFocus`).
  - title: Fragment
    link: /docs/components/fragment
    description: A logical grouping element that allows multiple children to be wrapped without introducing an additional component.
  - title: Image
    link: /docs/components/image
    description: Used to display images. It supports properties such as `src`, `alt`, `width`, `height`, and responsive `sources` for different screen sizes.
  - title: Row
    link: /docs/components/row
    description: A flexible container used for structuring layouts in a horizontal direction. It inherits most properties from `box`, except for the `direction` property.
  - title: Text
    link: /docs/components/text
    description: Used to render text with optional styling. It supports properties such as `color`, `background`, `heading` levels (h1-h6), text formatting `modifiers` (bold, italic, etc.), and inline display.
  - title: Textarea
    link: /docs/components/textarea
    description: A multi-line text input field that allows users to enter longer texts. It supports properties such as `name`, `value`, and event handlers (`onChange`, `onBlur`, `onFocus`).
---

# Components

User interfaces of apps created with `NubeSDK` are made from components that adapt to the store theme automatically, maintaining the design consistency. Can be developed with JSX or declarative functions.

In this section you will find all the components available in our library.

<CardGrid :items="$frontmatter.cards" />
