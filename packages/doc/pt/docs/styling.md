---
title: Estilização de Componentes
---

# Estilização de Componentes

O NubeSDK oferece múltiplas formas de estilizar seus componentes, garantindo flexibilidade enquanto mantém consistência com o tema da loja. Você pode usar a função `styled()` para CSS-in-JS, `StyleSheet.create()` para estilos reutilizáveis e o sistema de tema para design tokens.

## Visão Geral

Existem três abordagens principais para estilizar componentes no NubeSDK:

1. **Função `styled()`** - CSS-in-JS com template literals
2. **`StyleSheet.create()`** - Objetos de estilo reutilizáveis
3. **Integração com tema** - Design tokens e variáveis CSS

## Componentes Estilizados

A função `styled()` permite aplicar CSS customizado aos componentes usando template literals, similar ao styled-components.

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

<StyledBox>Conteúdo estilizado customizado</StyledBox>
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
  children: "Conteúdo estilizado customizado"
});
```

:::

### Interpolação de Template Literals

Você pode usar expressões JavaScript dentro do seu CSS:

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

### Recursos CSS

A função `styled()` suporta todos os recursos CSS:

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

### Propriedades CSS Customizadas

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

### Composição de Componentes

Você pode encadear componentes estilizados:

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

A função `StyleSheet.create()` permite criar objetos de estilo reutilizáveis com segurança de tipos.

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
  <Button style={styles.button}>Clique em mim</Button>
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
      children: "Clique em mim"
    })
  ]
});
```

:::

### Segurança de Tipos

StyleSheet fornece suporte completo ao TypeScript com validação de propriedades CSS:

```typescript
const styles = StyleSheet.create({
  container: {
    // ✅ Propriedades CSS válidas
    backgroundColor: "red",
    padding: "16px",
    margin: "8px",
    width: "100%",
    height: "200px",

    // ✅ Suporte ao tipo Size
    fontSize: "18px",
    lineHeight: "1.5",
    borderRadius: "8px",

    // ❌ TypeScript irá capturar propriedades inválidas
    // invalidProperty: "value", // Erro
  },
});
```

### Integração com Tema

StyleSheet funciona perfeitamente com o sistema de tema:

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

O sistema de tema fornece design tokens e variáveis CSS que se adaptam automaticamente ao tema da loja. O objeto `theme` dá acesso às variáveis configuradas em cada loja, permitindo que seus componentes se integrem perfeitamente ao estilo único de cada loja.

### Tokens de Tema Disponíveis

```typescript
import { theme } from "@tiendanube/nube-sdk-ui";

// Cores
theme.color.accent           // Cor de destaque primária
theme.color.main.foreground  // Cor do texto principal
theme.color.main.background  // Cor de fundo principal

// Bordas
theme.border.color           // Cor da borda padrão
theme.border.radius          // Raio da borda padrão

// Tokens específicos de componentes
theme.button.foreground      // Cor do texto do botão
theme.button.background      // Cor de fundo do botão
theme.button.borderColor     // Cor da borda do botão
theme.button.borderRadius    // Raio da borda do botão

theme.input.border.color     // Cor da borda do input

theme.header.foreground      // Cor do texto do cabeçalho
theme.header.background      // Cor de fundo do cabeçalho
theme.header.logo.maxWidth   // Largura máxima do logo do cabeçalho
theme.header.logo.fontSize   // Tamanho da fonte do logo do cabeçalho

theme.footer.foreground      // Cor do texto do rodapé
theme.footer.background      // Cor de fundo do rodapé

theme.heading.font           // Família da fonte dos títulos
theme.heading.fontWeight     // Peso da fonte dos títulos
```

### Usando Cores do Tema

As cores do tema se adaptam automaticamente ao tema da loja:

```typescript
import { theme } from "@tiendanube/nube-sdk-ui";

const styles = StyleSheet.create({
  adaptiveButton: {
    backgroundColor: theme.color.accent,
    color: theme.color.main.foreground,
  },
});

// O botão usará automaticamente as cores do tema da loja
```

### Opacidade das Cores do Tema

Você pode criar versões transparentes das cores do tema usando valores de opacidade predefinidos:

```typescript
import { theme } from "@tiendanube/nube-sdk-ui";

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: theme.color.accent.opacity(50), // 50% de opacidade
  },
  subtle: {
    backgroundColor: theme.color.main.background.opacity(10), // 10% de opacidade
  },
  transparent: {
    backgroundColor: theme.color.accent.opacity(0), // 0% de opacidade
  },
});
```

**Valores de opacidade disponíveis**: 0, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90

## Melhores Práticas

### 1. Use Tokens do Tema Quando Possível

Prefira tokens do tema em vez de valores fixos para manter consistência:

```typescript
// ✅ Bom - usa tokens do tema
const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.color.accent,
    borderRadius: theme.border.radius,
  },
});

// ❌ Evite - valores fixos
const styles = StyleSheet.create({
  button: {
    backgroundColor: "#007bff",
    borderRadius: "4px",
  },
});
```

### 2. Combine Abordagens de Estilização

Use diferentes abordagens para diferentes casos de uso:

```typescript
// Estilos reutilizáveis com StyleSheet
const baseStyles = StyleSheet.create({
  card: {
    backgroundColor: theme.color.main.background,
    borderRadius: theme.border.radius,
    padding: "16px",
  },
});

// Estilos estáticos com styled()
const HighlightCard = styled(box)`
  background-color: ${theme.color.accent};
  border: 2px solid ${theme.border.color};
`;
```

### 3. Design Responsivo

Use media queries para layouts responsivos:

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

### 4. Propriedades CSS Customizadas

Use propriedades CSS customizadas para valores dinâmicos:

```typescript
const DynamicBox = styled(box)`
  --custom-color: #ff6b6b;
  --custom-size: 16px;

  background-color: var(--custom-color);
  padding: var(--custom-size);
`;
```

## Exemplos

### Componente Completo com Múltiplas Abordagens de Estilização

```tsx
import { styled, StyleSheet, theme } from "@tiendanube/nube-sdk-ui";
import { Box, Button, Text } from "@tiendanube/nube-sdk-jsx";

// Estilos reutilizáveis
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
  <Text style={styles.title}>Bem-vindo ao NubeSDK</Text>
  <StyledButton>Começar</StyledButton>
</Box>
```

Este sistema abrangente de estilização oferece a flexibilidade para criar componentes bonitos, consistentes e conscientes do tema, mantendo a segurança de tipos e a experiência do desenvolvedor.
