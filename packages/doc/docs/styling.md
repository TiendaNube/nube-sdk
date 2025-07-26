---
title: Styling Components
---

# Styling Components

NubeSDK provides multiple ways to style your components, ensuring flexibility while maintaining consistency with the store's theme. You can use the `styled()` function for CSS-in-JS, `StyleSheet.create()` for reusable styles, and the theme system for design tokens.

## Overview

There are three main approaches to styling components in NubeSDK:

1. **`styled()` function** - CSS-in-JS with template literals
2. **`StyleSheet.create()`** - Reusable style objects
3. **Theme integration** - Design tokens and CSS variables

## Styled Components

The `styled()` function allows you to apply custom CSS to components using template literals, similar to styled-components.

### Basic Usage

::: code-group

```tsx [JSX]
import { styled } from "@tiendanube/nube-sdk-ui";
import { Box } from "@tiendanube/nube-sdk-jsx";

const StyledBox = styled(Box)`
  background-color: red;
  padding: 16px;
  border-radius: 8px;
`;

<StyledBox>Custom styled content</StyledBox>
```

```typescript [Declarative]
import { styled } from "@tiendanube/nube-sdk-ui";
import { box } from "@tiendanube/nube-sdk-ui";

const StyledBox = styled(box)`
  background-color: red;
  padding: 16px;
  border-radius: 8px;
`;

StyledBox({
  children: "Custom styled content"
});
```

:::

### Template Literal Interpolation

You can use JavaScript expressions within your CSS:

```typescript
const primaryColor = "var(--primary-color)";
const StyledBox = styled(box)`
  background-color: ${primaryColor};
  padding: ${16}px;
  margin: ${getSpacing()}px;
`;

function getSpacing() {
  return 20;
}
```

### CSS Features

The `styled()` function supports all CSS features:

```typescript
const StyledButton = styled(button)`
  background-color: blue;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: darkblue;
  }

  &:active {
    background-color: navy;
  }

  &:disabled {
    background-color: gray;
    cursor: not-allowed;
  }
`;
```

### Media Queries

```typescript
const ResponsiveBox = styled(box)`
  background-color: red;
  padding: 16px;

  @media (max-width: 768px) {
    padding: 8px;
    background-color: blue;
  }

  @media (min-width: 1024px) {
    padding: 24px;
    background-color: green;
  }
`;
```

### CSS Custom Properties

```typescript
const ThemedBox = styled(box)`
  --custom-color: #ff6b6b;
  --custom-padding: 20px;

  background-color: var(--custom-color);
  padding: var(--custom-padding);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;
```

### Component Composition

You can chain styled components:

```typescript
const BaseStyledBox = styled(box)`
  background-color: red;
  padding: 16px;
`;

const FinalStyledBox = styled(BaseStyledBox)`
  border: 2px solid black;
  margin: 8px;
`;
```

## StyleSheet

The `StyleSheet.create()` function allows you to create reusable style objects with type safety.

### Basic Usage

::: code-group

```tsx [JSX]
import { StyleSheet } from "@tiendanube/nube-sdk-ui";
import { Box } from "@tiendanube/nube-sdk-jsx";

const styles = StyleSheet.create({
  container: {
    backgroundColor: "red",
    padding: "16px",
    borderRadius: "8px",
  },
  button: {
    backgroundColor: "blue",
    color: "white",
    padding: "12px 24px",
  },
});

<Box style={styles.container}>
  <Button style={styles.button}>Click me</Button>
</Box>
```

```typescript [Declarative]
import { StyleSheet } from "@tiendanube/nube-sdk-ui";
import { box, button } from "@tiendanube/nube-sdk-ui";

const styles = StyleSheet.create({
  container: {
    backgroundColor: "red",
    padding: "16px",
    borderRadius: "8px",
  },
  button: {
    backgroundColor: "blue",
    color: "white",
    padding: "12px 24px",
  },
});

box({
  style: styles.container,
  children: [
    button({
      style: styles.button,
      children: "Click me"
    })
  ]
});
```

:::

### Type Safety

StyleSheet provides full TypeScript support with CSS property validation:

```typescript
const styles = StyleSheet.create({
  container: {
    // ✅ Valid CSS properties
    backgroundColor: "red",
    padding: "16px",
    margin: "8px",
    width: "100%",
    height: "200px",

    // ✅ Size type support
    fontSize: "18px",
    lineHeight: "1.5",
    borderRadius: "8px",

    // ❌ TypeScript will catch invalid properties
    // invalidProperty: "value", // Error
  },
});
```

### Theme Integration

StyleSheet works seamlessly with the theme system:

```typescript
import { StyleSheet, theme } from "@tiendanube/nube-sdk-ui";

const styles = StyleSheet.create({
  primaryButton: {
    backgroundColor: theme.color.accent,
    color: theme.color.main.foreground,
    padding: "12px 24px",
    borderRadius: theme.border.radius,
  },
  card: {
    backgroundColor: theme.color.main.background,
    border: `1px solid ${theme.border.color}`,
    borderRadius: theme.box.border.radius,
    padding: "16px",
  },
});
```

## Theme System

The theme system provides design tokens and CSS variables that automatically adapt to the store's theme. The `theme` object gives you access to the variables configured in each store, allowing your components to integrate seamlessly with each store's unique styling.

### Available Theme Tokens

```typescript
import { theme } from "@tiendanube/nube-sdk-ui";

// Colors
theme.color.accent           // Primary accent color
theme.color.main.foreground  // Main text color
theme.color.main.background  // Main background color

// Borders
theme.border.color           // Default border color
theme.border.radius          // Default border radius

// Component-specific tokens
theme.button.foreground      // Button text color
theme.button.background      // Button background color
theme.button.borderColor     // Button border color
theme.button.borderRadius    // Button border radius

theme.input.border.color     // Input border color

theme.header.foreground      // Header text color
theme.header.background      // Header background color
theme.header.logo.maxWidth   // Header logo max width
theme.header.logo.fontSize   // Header logo font size

theme.footer.foreground      // Footer text color
theme.footer.background      // Footer background color

theme.heading.font           // Heading font family
theme.heading.fontWeight     // Heading font weight
```

### Using Theme Colors

Theme colors automatically adapt to the store's theme:

```typescript
import { theme } from "@tiendanube/nube-sdk-ui";

const styles = StyleSheet.create({
  adaptiveButton: {
    backgroundColor: theme.color.accent,
    color: theme.color.main.foreground,
  },
});

// The button will automatically use the store's theme colors
```

### Theme Color Opacity

You can create transparent versions of theme colors using predefined opacity values:

```typescript
import { theme } from "@tiendanube/nube-sdk-ui";

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: theme.color.accent.opacity(50), // 50% opacity
  },
  subtle: {
    backgroundColor: theme.color.main.background.opacity(10), // 10% opacity
  },
  transparent: {
    backgroundColor: theme.color.accent.opacity(0), // 0% opacity
  },
});
```

**Available opacity values**: 0, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90

## Best Practices

### 1. Use Theme Tokens When Possible

Prefer theme tokens over hardcoded values to maintain consistency:

```typescript
// ✅ Good - uses theme tokens
const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.color.accent,
    borderRadius: theme.border.radius,
  },
});

// ❌ Avoid - hardcoded values
const styles = StyleSheet.create({
  button: {
    backgroundColor: "#007bff",
    borderRadius: "4px",
  },
});
```

### 2. Combine Styling Approaches

Use different approaches for different use cases:

```typescript
// Reusable styles with StyleSheet
const baseStyles = StyleSheet.create({
  card: {
    backgroundColor: theme.color.main.background,
    borderRadius: theme.border.radius,
    padding: "16px",
  },
});

// Static styles with styled()
const HighlightCard = styled(box)`
  background-color: ${theme.color.accent};
  border: 2px solid ${theme.border.color};
`;
```

### 3. Responsive Design

Use media queries for responsive layouts:

```typescript
const ResponsiveContainer = styled(box)`
  padding: 16px;
  flex-direction: column;

  @media (min-width: 768px) {
    padding: 24px;
    flex-direction: row;
  }
`;
```

### 4. CSS Custom Properties

Use CSS custom properties for dynamic values:

```typescript
const DynamicBox = styled(box)`
  --custom-color: #ff6b6b;
  --custom-size: 16px;

  background-color: var(--custom-color);
  padding: var(--custom-size);
`;
```

## Examples

### Complete Component with Multiple Styling Approaches

```tsx
import { styled, StyleSheet, theme } from "@tiendanube/nube-sdk-ui";
import { Box, Button, Text } from "@tiendanube/nube-sdk-jsx";

// Reusable styles
const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.color.main.background,
    borderRadius: theme.border.radius,
    padding: "24px",
  },
  title: {
    color: theme.color.main.foreground,
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "16px",
  },
});

// Static styled component
const StyledButton = styled(Button)`
  background-color: ${theme.color.accent};
  color: white;
  padding: 12px 24px;
  border-radius: ${theme.border.radius};
  border: 1px solid ${theme.border.color};
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

// Usage
<Box style={styles.container}>
  <Text style={styles.title}>Welcome to NubeSDK</Text>
  <StyledButton>Get Started</StyledButton>
</Box>
```

This comprehensive styling system gives you the flexibility to create beautiful, consistent, and theme-aware components while maintaining type safety and developer experience.
