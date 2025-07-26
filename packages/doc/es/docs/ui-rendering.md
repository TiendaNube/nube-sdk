# Renderizado de UI

El NubeSDK proporciona métodos poderosos para renderizar y gestionar componentes de UI dinámicamente en los slots del checkout. Esto permite crear interfaces dinámicas que pueden ser actualizadas basándose en el estado actual de la aplicación.

## Método Render

El método `render` te permite inyectar componentes en slots de UI específicos. Soporta tanto componentes estáticos como componentes dinámicos que se computan basándose en el estado actual.

### Renderizado Estático

```ts
import type { NubeSDK } from "@tiendanube/nube-sdk-types";
import { Button, Text } from "@tiendanube/nube-sdk-jsx";

export function App(nube: NubeSDK) {
  // Renderizar un componente estático
  nube.render("after_line_items", (
    <Button onClick={() => console.log("¡Clicado!")}>
      Botón Estático
    </Button>
  ));
}
```

### Renderizado Dinámico

Puedes pasar una función que recibe el estado actual y retorna un componente. Esto permite UI dinámica que puede ser computada basándose en el estado actual.

```ts
import type { NubeSDK } from "@tiendanube/nube-sdk-types";
import { Button, Text } from "@tiendanube/nube-sdk-jsx";

export function App(nube: NubeSDK) {
  // Renderizar un componente dinámico
  nube.render("after_line_items", (state) => {
    const itemCount = state.cart.items.length;

    return (
      <Text>
        Tienes {itemCount} artículos en tu carrito
      </Text>
    );
  });
}
```

### Renderizado Condicional

El enfoque dinámico es perfecto para renderizado condicional basado en el estado actual.

```ts
import type { NubeSDK } from "@tiendanube/nube-sdk-types";
import { Button, Text } from "@tiendanube/nube-sdk-jsx";

export function App(nube: NubeSDK) {
  nube.render("after_line_items", (state) => {
    // Solo mostrar si el carrito tiene artículos
    if (state.cart.items.length === 0) {
      return null; // No se renderizará nada
    }

    return (
      <Button onClick={() => nube.send("cart:clear")}>
        Limpiar Carrito ({state.cart.items.length} artículos)
      </Button>
    );
  });
}
```

## Método ClearSlot

El método `clearSlot` remueve componentes de un slot de UI específico, efectivamente limpiando el contenido renderizado.

```ts
import type { NubeSDK } from "@tiendanube/nube-sdk-types";

export function App(nube: NubeSDK) {
  // Renderizar un componente
  nube.render("after_line_items", <Text>Hola Mundo</Text>);

  // Después, removerlo
  nube.clearSlot("after_line_items");
}
```

## Mejores Prácticas

### 1. Limpiar al Cambiar de Página

Siempre limpia los slots al navegar entre páginas para evitar componentes obsoletos.

```ts
import type { NubeSDK } from "@tiendanube/nube-sdk-types";

export function App(nube: NubeSDK) {
  nube.on("checkout:ready", ({ location }) => {
    // Limpiar contenido anterior
    nube.clearSlot("after_line_items");

    // Renderizar nuevo contenido basado en la página actual
    if (location.page.type === "checkout") {
      nube.render("after_line_items", <Text>Página de Checkout</Text>);
    }
  });
}
```

### 2. Usar Componentes Dinámicos para Contenido Basado en Estado

Prefiere componentes dinámicos cuando la UI necesita ser computada basándose en el estado actual.

```ts
export function App(nube: NubeSDK) {
  // Bueno: Componente dinámico
  nube.render("after_line_items", (state) => (
    <Text>Total: $ {state.cart.total}</Text>
  ));

  // Nota: Necesitas re-renderizar manualmente cuando el estado cambia
  nube.on("cart:updated", () => {
    nube.clearSlot("after_line_items");
    nube.render("after_line_items", (state) => (
      <Text>Total: $ {state.cart.total}</Text>
    ));
  });
}
```

### 3. Gestionar el Ciclo de Vida del Componente

Considera el ciclo de vida de tus componentes y limpia cuando sea necesario.

```ts
export function App(nube: NubeSDK) {
  let isComponentRendered = false;

  nube.on("checkout:ready", ({ location }) => {
    if (location.page.type === "checkout" && !isComponentRendered) {
      nube.render("after_line_items", <Text>Componente</Text>);
      isComponentRendered = true;
    }
  });

  nube.on("checkout:leave", () => {
    if (isComponentRendered) {
      nube.clearSlot("after_line_items");
      isComponentRendered = false;
    }
  });
}
```

## Integración con Eventos

Los métodos de renderizado funcionan perfectamente con el sistema de eventos del SDK. Nota que necesitas re-renderizar manualmente los componentes cuando el estado cambia.

```ts
export function App(nube: NubeSDK) {
  // Renderizar un componente que responde a eventos
  nube.render("after_line_items", (state) => (
    <Button
      onClick={() => nube.send("cart:validate", () => ({
        cart: { validation: { status: "success" } }
      }))}
    >
      Validar Carrito
    </Button>
  ));

  // Necesitas re-renderizar manualmente cuando el estado cambia
  nube.on("cart:validation:updated", () => {
    nube.clearSlot("after_line_items");
    nube.render("after_line_items", (state) => (
      <Button
        onClick={() => nube.send("cart:validate", () => ({
          cart: { validation: { status: "success" } }
        }))}
      >
        Validar Carrito
      </Button>
    ));
  });
}
```

## Slots Disponibles

Para una lista completa de los slots de UI disponibles, consulta la documentación [UI Slots](/docs/ui-slots).

## Relacionado

- [UI Slots](/docs/ui-slots) - Aprende sobre los slots disponibles
- [Componentes](/docs/components) - Componentes de UI disponibles
- [Gestión de Estado](/docs/state) - Entendiendo el estado del SDK
- [Eventos](/docs/events) - Trabajando con eventos del SDK
