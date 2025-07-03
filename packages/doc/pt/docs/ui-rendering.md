# Renderização de UI

O NubeSDK fornece métodos poderosos para renderizar e gerenciar componentes de UI dinamicamente nos slots do checkout. Isso permite criar interfaces dinâmicas que podem ser atualizadas com base no estado atual da aplicação.

## Método Render

O método `render` permite injetar componentes em slots de UI específicos. Ele suporta tanto componentes estáticos quanto componentes dinâmicos que são computados com base no estado atual.

### Renderização Estática

```ts
import type { NubeSDK } from "@tiendanube/nube-sdk-types";
import { Button, Text } from "@tiendanube/nube-sdk-jsx";

export function App(nube: NubeSDK) {
  // Renderizar um componente estático
  nube.render("after_line_items", (
    <Button onClick={() => console.log("Clicado!")}>
      Botão Estático
    </Button>
  ));
}
```

### Renderização Dinâmica

Você pode passar uma função que recebe o estado atual e retorna um componente. Isso permite UI dinâmica que pode ser computada com base no estado atual.

```ts
import type { NubeSDK } from "@tiendanube/nube-sdk-types";
import { Button, Text } from "@tiendanube/nube-sdk-jsx";

export function App(nube: NubeSDK) {
  // Renderizar um componente dinâmico
  nube.render("after_line_items", (state) => {
    const itemCount = state.cart.items.length;

    return (
      <Text>
        Você tem {itemCount} itens no seu carrinho
      </Text>
    );
  });
}
```

### Renderização Condicional

A abordagem dinâmica é perfeita para renderização condicional baseada no estado atual.

```ts
import type { NubeSDK } from "@tiendanube/nube-sdk-types";
import { Button, Text } from "@tiendanube/nube-sdk-jsx";

export function App(nube: NubeSDK) {
  nube.render("after_line_items", (state) => {
    // Só mostrar se o carrinho tem itens
    if (state.cart.items.length === 0) {
      return null; // Nada será renderizado
    }

    return (
      <Button onClick={() => nube.send("cart:clear")}>
        Limpar Carrinho ({state.cart.items.length} itens)
      </Button>
    );
  });
}
```

## Método ClearSlot

O método `clearSlot` remove componentes de um slot de UI específico, efetivamente limpando o conteúdo renderizado.

```ts
import type { NubeSDK } from "@tiendanube/nube-sdk-types";

export function App(nube: NubeSDK) {
  // Renderizar um componente
  nube.render("after_line_items", <Text>Olá Mundo</Text>);

  // Depois, removê-lo
  nube.clearSlot("after_line_items");
}
```

## Melhores Práticas

### 1. Limpar ao Mudar de Página

Sempre limpe os slots ao navegar entre páginas para evitar componentes desatualizados.

```ts
import type { NubeSDK } from "@tiendanube/nube-sdk-types";

export function App(nube: NubeSDK) {
  nube.on("checkout:ready", ({ location }) => {
    // Limpar conteúdo anterior
    nube.clearSlot("after_line_items");

    // Renderizar novo conteúdo baseado na página atual
    if (location.page.type === "checkout") {
      nube.render("after_line_items", <Text>Página de Checkout</Text>);
    }
  });
}
```

### 2. Usar Componentes Dinâmicos para Conteúdo Baseado no Estado

Prefira componentes dinâmicos quando a UI precisa ser computada com base no estado atual.

```ts
export function App(nube: NubeSDK) {
  // Bom: Componente dinâmico
  nube.render("after_line_items", (state) => (
    <Text>Total: R$ {state.cart.total}</Text>
  ));

  // Nota: Você precisa re-renderizar manualmente quando o estado muda
  nube.on("cart:updated", () => {
    nube.clearSlot("after_line_items");
    nube.render("after_line_items", (state) => (
      <Text>Total: R$ {state.cart.total}</Text>
    ));
  });
}
```

### 3. Gerenciar o Ciclo de Vida do Componente

Considere o ciclo de vida dos seus componentes e limpe quando necessário.

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

## Integração com Eventos

Os métodos de renderização funcionam perfeitamente com o sistema de eventos do SDK. Note que você precisa re-renderizar manualmente os componentes quando o estado muda.

```ts
export function App(nube: NubeSDK) {
  // Renderizar um componente que responde a eventos
  nube.render("after_line_items", (state) => (
    <Button
      onClick={() => nube.send("cart:validate", () => ({
        cart: { validation: { status: "success" } }
      }))}
    >
      Validar Carrinho
    </Button>
  ));

  // Você precisa re-renderizar manualmente quando o estado muda
  nube.on("cart:validation:updated", () => {
    nube.clearSlot("after_line_items");
    nube.render("after_line_items", (state) => (
      <Button
        onClick={() => nube.send("cart:validate", () => ({
          cart: { validation: { status: "success" } }
        }))}
      >
        Validar Carrinho
      </Button>
    ));
  });
}
```

## Slots Disponíveis

Para uma lista completa dos slots de UI disponíveis, consulte a documentação [UI Slots](/docs/ui-slots).

## Relacionado

- [UI Slots](/docs/ui-slots) - Aprenda sobre os slots disponíveis
- [Componentes](/docs/components) - Componentes de UI disponíveis
- [Gerenciamento de Estado](/docs/state) - Entendendo o estado do SDK
- [Eventos](/docs/events) - Trabalhando com eventos do SDK
