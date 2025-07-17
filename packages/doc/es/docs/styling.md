---
title: Estilización de Componentes
---

# Estilización de Componentes

NubeSDK proporciona múltiples formas de estilizar tus componentes, asegurando flexibilidad mientras mantiene consistencia con el tema de la tienda. Puedes usar la función `styled()` para CSS-in-JS, `StyleSheet.create()` para estilos reutilizables y el sistema de tema para design tokens.

## Visión General

Existen tres enfoques principales para estilizar componentes en NubeSDK:

1. **Función `styled()`** - CSS-in-JS con template literals
2. **`StyleSheet.create()`** - Objetos de estilo reutilizables
3. **Integración con tema** - Design tokens y variables CSS

## Componentes Estilizados

La función `styled()` permite aplicar CSS personalizado a los componentes usando template literals, similar a styled-components.

### Uso Básico

::: code-group

```tsx [JSX]
import { styled } from "@tiendanube/nube-sdk-ui";
import { Box } from "@tiendanube/nube-sdk-jsx";

const StyledBox = styled(Box)`
  background-color: red;
  padding: 16px;
  border-radius: 8px;
`;

<StyledBox>Contenido estilizado personalizado</StyledBox>
```

```typescript [Declarativo]
import { styled } from "@tiendanube/nube-sdk-ui";
import { box } from "@tiendanube/nube-sdk-ui";

const StyledBox = styled(box)`
  background-color: red;
  padding: 16px;
  border-radius: 8px;
`;

StyledBox({
  children: "Contenido estilizado personalizado"
});
```

:::

### Interpolación de Template Literals

Puedes usar expresiones JavaScript dentro de tu CSS:

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

### Características CSS

La función `styled()` soporta todas las características CSS:

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

### Propiedades CSS Personalizadas

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

### Composición de Componentes

Puedes encadenar componentes estilizados:

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

La función `StyleSheet.create()` permite crear objetos de estilo reutilizables con seguridad de tipos.

### Uso Básico

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
  <Button style={styles.button}>Haz clic aquí</Button>
</Box>
```

```typescript [Declarativo]
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
      children: "Haz clic aquí"
    })
  ]
});
```

:::

### Seguridad de Tipos

StyleSheet proporciona soporte completo para TypeScript con validación de propiedades CSS:

```typescript
const styles = StyleSheet.create({
  container: {
    // ✅ Propiedades CSS válidas
    backgroundColor: "red",
    padding: "16px",
    margin: "8px",
    width: "100%",
    height: "200px",

    // ✅ Soporte para el tipo Size
    fontSize: "18px",
    lineHeight: "1.5",
    borderRadius: "8px",

    // ❌ TypeScript capturará propiedades inválidas
    // invalidProperty: "value", // Error
  },
});
```

### Integración con Tema

StyleSheet funciona perfectamente con el sistema de tema:

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

## Sistema de Tema

El sistema de tema proporciona design tokens y variables CSS que se adaptan automáticamente al tema de la tienda. El objeto `theme` te da acceso a las variables configuradas en cada tienda, permitiendo que tus componentes se integren perfectamente con el estilo único de cada tienda.

### Tokens de Tema Disponibles

```typescript
import { theme } from "@tiendanube/nube-sdk-ui";

// Colores
theme.color.accent           // Color de acento primario
theme.color.main.foreground  // Color del texto principal
theme.color.main.background  // Color de fondo principal

// Bordes
theme.border.color           // Color del borde por defecto
theme.border.radius          // Radio del borde por defecto

// Tokens específicos de componentes
theme.button.foreground      // Color del texto del botón
theme.button.background      // Color de fondo del botón
theme.button.borderColor     // Color del borde del botón
theme.button.borderRadius    // Radio del borde del botón

theme.input.border.color     // Color del borde del input

theme.header.foreground      // Color del texto del encabezado
theme.header.background      // Color de fondo del encabezado
theme.header.logo.maxWidth   // Ancho máximo del logo del encabezado
theme.header.logo.fontSize   // Tamaño de fuente del logo del encabezado

theme.footer.foreground      // Color del texto del pie de página
theme.footer.background      // Color de fondo del pie de página

theme.heading.font           // Familia de fuente de los títulos
theme.heading.fontWeight     // Peso de fuente de los títulos
```

### Usando Colores del Tema

Los colores del tema se adaptan automáticamente al tema de la tienda:

```typescript
import { theme } from "@tiendanube/nube-sdk-ui";

const styles = StyleSheet.create({
  adaptiveButton: {
    backgroundColor: theme.color.accent,
    color: theme.color.main.foreground,
  },
});

// El botón usará automáticamente los colores del tema de la tienda
```

### Opacidad de los Colores del Tema

Puedes crear versiones transparentes de los colores del tema usando valores de opacidad predefinidos:

```typescript
import { theme } from "@tiendanube/nube-sdk-ui";

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: theme.color.accent.opacity(50), // 50% de opacidad
  },
  subtle: {
    backgroundColor: theme.color.main.background.opacity(10), // 10% de opacidad
  },
  transparent: {
    backgroundColor: theme.color.accent.opacity(0), // 0% de opacidad
  },
});
```

**Valores de opacidad disponibles**: 0, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90

## Mejores Prácticas

### 1. Usa Tokens del Tema Cuando Sea Posible

Prefiere tokens del tema en lugar de valores fijos para mantener consistencia:

```typescript
// ✅ Bueno - usa tokens del tema
const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.color.accent,
    borderRadius: theme.border.radius,
  },
});

// ❌ Evita - valores fijos
const styles = StyleSheet.create({
  button: {
    backgroundColor: "#007bff",
    borderRadius: "4px",
  },
});
```

### 2. Combina Enfoques de Estilización

Usa diferentes enfoques para diferentes casos de uso:

```typescript
// Estilos reutilizables con StyleSheet
const baseStyles = StyleSheet.create({
  card: {
    backgroundColor: theme.color.main.background,
    borderRadius: theme.border.radius,
    padding: "16px",
  },
});

// Estilos estáticos con styled()
const HighlightCard = styled(box)`
  background-color: ${theme.color.accent};
  border: 2px solid ${theme.border.color};
`;
```

### 3. Diseño Responsivo

Usa media queries para layouts responsivos:

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

### 4. Propiedades CSS Personalizadas

Usa propiedades CSS personalizadas para valores dinámicos:

```typescript
const DynamicBox = styled(box)`
  --custom-color: #ff6b6b;
  --custom-size: 16px;

  background-color: var(--custom-color);
  padding: var(--custom-size);
`;
```

## Ejemplos

### Componente Completo con Múltiples Enfoques de Estilización

```tsx
import { styled, StyleSheet, theme } from "@tiendanube/nube-sdk-ui";
import { Box, Button, Text } from "@tiendanube/nube-sdk-jsx";

// Estilos reutilizables
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

// Componente estilizado estático
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

// Uso
<Box style={styles.container}>
  <Text style={styles.title}>Bienvenido a NubeSDK</Text>
  <StyledButton>Comenzar</StyledButton>
</Box>
```

Este sistema integral de estilización te ofrece la flexibilidad para crear componentes hermosos, consistentes y conscientes del tema, manteniendo la seguridad de tipos y la experiencia del desarrollador.
