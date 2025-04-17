# Eventos

A comunicação entre a página principal e os apps é feita através de eventos, garantindo uma integração reativa e flexível onde cada componente opera independentemente sem chamadas diretas.

- **Eventos Disparados pela Loja:**  
  Quando ocorrem mudanças significativas—como uma atualização no carrinho de compras—a loja dispara eventos (por exemplo, `cart:update`) para notificar os apps que uma mudança ocorreu.

- **Eventos Disparados pelos Apps:**  
  Por outro lado, os apps podem emitir eventos (como `cart:validate`) para relatar a validade do conteúdo do carrinho ou para sinalizar que ações adicionais podem ser necessárias.

Esta abordagem baseada em eventos permite que a aplicação responda em tempo real a mudanças de estado, simplificando a manutenção e melhorando a escalabilidade.

## `config:set`

Disparado pelo `app` para definir a configuração inicial

```typescript title="Example"
nube.send("config:set", () => {
  config: {
    has_cart_validation: true
  },
});
```

### AppConfig

| Tipo de Configuração           | Tipo    | Para que serve?                                           |
| ------------------------------ | ------- | --------------------------------------------------------- |
| `has_cart_validation`          | boolean | Habilita o recurso de validação do carrinho               |
| `disable_shipping_more_options`| boolean | Determina se o usuário pode selecionar uma opção de envio |

## `cart:update`

Disparado pela `loja` quando o conteúdo do carrinho muda

```typescript title="Example"
nube.on("cart:update", ({ cart }) => {
  if (cart.items > 5) {
    console.log("Comprou mais de 5 itens diferentes");
  }
});
```

## `cart:validate`

Disparado por `app` para sinalizar se o conteúdo do carrinho é válido ou não. Requer `has_cart_validation: true` na configuração do script para funcionar, caso contrário, os eventos de validação do carrinho são ignorados.

```typescript title="Example"
// Informar ao NubeSDK que este script deseja validar o conteúdo do carrinho
nube.send("config:set", () => ({
  config: {
    has_cart_validation: true
  },
}));

nube.on("cart:update", ({ cart }) => {
  // Rejeitar o carrinho se tiver menos de 5 itens
  if (cart.items.length < 5) {
    // Disparar um evento `cart:validate` com falha com o motivo pelo qual falhou na validação
    nube.send("cart:validate", () => ({
      cart: {
        validation: {
          status: "fail",
          reason: "O carrinho deve ter pelo menos 5 itens!",
        },
      },
    }));
    return;
  }
  // Disparar um evento `cart:validate` bem-sucedido
  nube.send("cart:validate", () => ({
    cart: { validation: { status: "success" } },
  }));
}
```

## `shipping:update`

Disparado pela `loja` quando o método de envio muda.

```typescript
nube.on("shipping:update", ({ shipping }) => {
  if (shipping?.selected) {
    console.log(
      `O método de envio selecionado mudou para: ${shipping?.selected}`
    );
  }
});
```

## `customer:update`

Disparado pela `loja` quando os dados do cliente mudam.

```typescript
nube.on("customer:update", ({ customer }) => {
  console.log(`O nome do cliente mudou para: ${customer?.contact?.name}`);
});
```

## `payment:update`

Disparado pela `loja` quando o método de pagamento muda.

```typescript
nube.on("payment:update", ({ payment }) => {
  console.log(`O método de pagamento mudou para: ${payment?.selected}`);
});
```

## `shipping:update:label`

Disparado pelo `app` para alterar o rótulo do método de envio no checkout.

```typescript
nube.send("shipping:update:label", () => ({
  shipping: {
    custom_labels: {
      "ne-correios-sedex": "Meu rótulo personalizado",
    },
  },
}));
```

## `ui:slot:set`

Disparado pelo `app` para configurar o conteúdo de um slot de UI.

```tsx
import type { NubeSDK } from "@tiendanube/nube-sdk-types";
import { Row, Text } from "@tiendanube/nube-sdk-jsx";

function MyComponent() {
  return (
    <Row>
      <Text>Olá!</Text>
    </Row>
  );
}

export function App(nube: NubeSDK) {
  nube.send("ui:slot:set", () => ({
    ui: {
      slots: {
        after_line_items: <MyComponent />,
      },
    },
  }));
}
```

Também pode ser usado para remover o conteúdo de um slot, especificando `undefined` como conteúdo.

```typescript title="Example"
nube.send("ui:slot:set", () => ({
  ui: {
    slots: {
      before_line_items: undefined,
    },
  },
}));
```
