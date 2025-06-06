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
nube.send("config:set", () => ({
  config: {
    has_cart_validation: true
  },
}));
```

### AppConfig

| Tipo de Configuração           | Tipo    | Para que serve?                                           |
| ------------------------------ | ------- | --------------------------------------------------------- |
| `has_cart_validation`          | boolean | Habilita o recurso de validação do carrinho               |
| `disable_shipping_more_options`| boolean | Determina se o usuário pode selecionar uma opção de envio |

## `cart:update`

Disparado pela `loja` quando o conteúdo do carrinho muda

```typescript
nube.on("cart:update", ({ cart }) => {
  if (cart.items.length > 5) {
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
});
```

## `cart:add`

Disparado pelo `app` para adicionar um item ao carrinho.

```typescript
nube.send("cart:add", () => ({
  cart: {
    items: [{
      variant_id: 123,
      quantity: 1,
    }]
  },
}))
```

## `cart:add:success`

Disparado pela `loja` quando um item é adicionado com sucesso ao carrinho.

```typescript
nube.on("cart:add:success", ({ cart }) => {
  console.log(`Item ${cart.item.variant_id} foi adicionado com sucesso ao carrinho`);
});
```

## `cart:add:fail`

Disparado pela `loja` quando ocorre uma falha ao adicionar um item ao carrinho.

```typescript
nube.on("cart:add:fail", ({ cart }) => {
  console.log(`Falha ao adicionar item ${cart.item.variant_id} ao carrinho`);
});
```

## `cart:remove`

Disparado pelo `app` para remover um item do carrinho.

```typescript
nube.send("cart:remove", () => ({
  cart: {
    items: [{
      variant_id: 123,
      quantity: 1,
    }]
  },
}));
```

## `cart:remove:success`

Disparado pela `loja` quando um item é removido com sucesso do carrinho.

```typescript
nube.on("cart:remove:success", ({ cart }) => {
  console.log(`Item ${cart.items[0].variant_id} foi removido com sucesso do carrinho`);
});
```

## `cart:remove:fail`

Disparado pela `loja` quando ocorre uma falha ao remover um item do carrinho.

```typescript
nube.on("cart:remove:fail", ({ cart }) => {
  console.log(`Falha ao remover item ${cart.items[0].variant_id} do carrinho`);
});
```

## `coupon:add`

Disparado pelo `app` para adicionar um código de cupom ao carrinho.

```typescript
nube.send("coupon:add", () => ({
  coupon: {
    code: "SUMMER2024"
  }
}));
```

## `coupon:add:success`

Disparado pela `loja` quando um cupom é adicionado com sucesso ao carrinho.

```typescript
nube.on("coupon:add:success", ({ coupon }) => {
  console.log(`Cupom ${coupon.code} foi aplicado com sucesso`);
});
```

## `coupon:add:fail`

Disparado pela `loja` quando ocorre uma falha ao adicionar um cupom ao carrinho.

```typescript
nube.on("coupon:add:fail", ({ coupon }) => {
  console.log(`Falha ao aplicar cupom ${coupon.code}`);
});
```

## `coupon:remove`

Disparado pelo `app` para remover um código de cupom do carrinho.

```typescript
nube.send("coupon:remove");
```

## `coupon:remove:success`

Disparado pela `loja` quando um cupom é removido com sucesso do carrinho.

```typescript
nube.on("coupon:remove:success", () => {
  console.log("Cupom foi removido com sucesso do carrinho");
});
```

## `coupon:remove:fail`

Disparado pela `loja` quando ocorre uma falha ao remover um cupom do carrinho.

```typescript
nube.on("coupon:remove:fail", () => {
  console.log("Falha ao remover cupom do carrinho");
});
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

## `shipping:select`

Disparado pelo `app` para selecionar um método de envio. Após disparar este evento, a loja responderá com `shipping:select:success` ou `shipping:select:fail`.

```typescript
function App (nube: NubeSDK) {
  nube.send("shipping:select", () => ({
    shipping: {
      selected: "ne-correios-sedex",
    }
  }));
  
  nube.on("shipping:select:success", ({ shipping }) => {
    console.log("Selected option", shipping.selected)
  });
  
  nube.on("shipping:select:fail", ({ shipping }) => {
    console.log("Selected option", shipping.selected)
  });
}
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
