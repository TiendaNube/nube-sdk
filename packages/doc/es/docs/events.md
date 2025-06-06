# Eventos

La comunicación entre la página principal y las apps se maneja a través de eventos, garantizando una integración reactiva y flexible donde cada componente opera de forma independiente sin llamadas directas.

- **Eventos Disparados por la Tienda:**  
  Cuando ocurren cambios significativos—como una actualización en el carrito de compras—la tienda dispara eventos (por ejemplo, `cart:update`) para notificar a los scripts que ha ocurrido un cambio.

- **Eventos Disparados por las Apps:**  
  Por otro lado, los apps pueden emitir eventos (como `cart:validate`) para informar sobre la validez del contenido del carrito o para señalar que pueden ser necesarias acciones adicionales.

Este enfoque basado en eventos permite que la aplicación responda en tiempo real a los cambios de estado, simplificando el mantenimiento y mejorando la escalabilidad.

## `config:set`

Disparado por la `app` para definir la configuración inicial

```typescript
nube.send("config:set", () => ({
  config: {
    has_cart_validation: true
  },
}));
```

### AppConfig

| Tipo de Configuración          | Tipo    | ¿Para qué sirve?                                              |
| ------------------------------ | ------- | ------------------------------------------------------------- |
| `has_cart_validation`          | boolean | Habilita la función de validación del carrito                 |
| `disable_shipping_more_options`| boolean | Determina si el usuario puede seleccionar una opción de envío |

## `cart:update`

Disparado por la `tienda` cuando el contenido del carrito cambia

```typescript
nube.on("cart:update", ({ cart }) => {
  if (cart.items.length > 5) {
    console.log("Compró más de 5 artículos diferentes");
  }
});
```

## `cart:validate`

Disparado por `app` para señalar si el contenido del carrito es válido o no. Requiere `has_cart_validation: true` en la configuración del script para funcionar, de lo contrario, los eventos de validación del carrito son ignorados.

```typescript title="Example"
// Informar a NubeSDK que este script desea validar el contenido del carrito
nube.send("config:set", () => ({
  config: {
    has_cart_validation: true
  },
}));

nube.on("cart:update", ({ cart }) => {
  // Rechazar el carrito si tiene menos de 5 artículos
  if (cart.items.length < 5) {
    // Disparar un evento `cart:validate` fallido con la razón por la que falló la validación
    nube.send("cart:validate", () => ({
      cart: {
        validation: {
          status: "fail",
          reason: "¡El carrito debe tener al menos 5 artículos!",
        },
      },
    }));
    return;
  }
  // Disparar un evento `cart:validate` exitoso
  nube.send("cart:validate", () => ({
    cart: { validation: { status: "success" } },
  }));
});
```

## `cart:add`

Disparado por la `app` para agregar un producto al carrito.

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

Disparado por la `tienda` cuando un producto se agrega exitosamente al carrito.

```typescript
nube.on("cart:add:success", ({ cart }) => {
  console.log(`El producto ${cart.item.variant_id} se agregó exitosamente al carrito`);
});
```

## `cart:add:fail`

Disparado por la `tienda` cuando hay un error al agregar un producto al carrito.

```typescript
nube.on("cart:add:fail", ({ cart }) => {
  console.log(`Error al agregar el producto ${cart.item.variant_id} al carrito`);
});
```

## `cart:remove`

Disparado por la `app` para eliminar un producto del carrito.

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

Disparado por la `tienda` cuando un producto se elimina exitosamente del carrito.

```typescript
nube.on("cart:remove:success", ({ cart }) => {
  console.log(`El producto ${cart.items[0].variant_id} se eliminó exitosamente del carrito`);
});
```

## `cart:remove:fail`

Disparado por la `tienda` cuando hay un error al eliminar un producto del carrito.

```typescript
nube.on("cart:remove:fail", ({ cart }) => {
  console.log(`Error al eliminar el producto ${cart.items[0].variant_id} del carrito`);
});
```

## `coupon:add`

Disparado por la `app` para agregar un código de cupón al carrito.

```typescript
nube.send("coupon:add", () => ({
  coupon: {
    code: "SUMMER2024"
  }
}));
```

## `coupon:add:success`

Disparado por la `tienda` cuando un cupón se agrega exitosamente al carrito.

```typescript
nube.on("coupon:add:success", ({ coupon }) => {
  console.log(`El cupón ${coupon.code} se aplicó exitosamente`);
});
```

## `coupon:add:fail`

Disparado por la `tienda` cuando hay un error al agregar un cupón al carrito.

```typescript
nube.on("coupon:add:fail", ({ coupon }) => {
  console.log(`Error al aplicar el cupón ${coupon.code}`);
});
```

## `coupon:remove`

Disparado por la `app` para eliminar un código de cupón del carrito.

```typescript
nube.send("coupon:remove");
```

## `coupon:remove:success`

Disparado por la `tienda` cuando un cupón se elimina exitosamente del carrito.

```typescript
nube.on("coupon:remove:success", () => {
  console.log("El cupón se eliminó exitosamente del carrito");
});
```

## `coupon:remove:fail`

Disparado por la `tienda` cuando hay un error al eliminar un cupón del carrito.

```typescript
nube.on("coupon:remove:fail", () => {
  console.log("Error al eliminar el cupón del carrito");
});
```

## `shipping:update`

Disparado por la `tienda` cuando el método de envío cambia.

```typescript
nube.on("shipping:update", ({ shipping }) => {
  if (shipping?.selected) {
    console.log(
      `El método de envío seleccionado ha cambiado a: ${shipping?.selected}`
    );
  }
});
```

## `shipping:select`

Disparado por la `app` para seleccionar un método de envío. Después de disparar este evento, la tienda responderá con `shipping:select:success` o `shipping:select:fail`.

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

Disparado por la `tienda` cuando los datos del cliente cambian.

```typescript
nube.on("customer:update", ({ customer }) => {
  console.log(`El nombre del cliente ha cambiado a: ${customer?.contact?.name}`);
});
```

## `payment:update`

Disparado por la `tienda` cuando el método de pago cambia.

```typescript
nube.on("payment:update", ({ payment }) => {
  console.log(`El método de pago ha cambiado a: ${payment?.selected}`);
});
```

## `shipping:update:label`

Disparado por la `app` para cambiar la etiqueta del método de envío en el checkout.

```typescript
nube.send("shipping:update:label", () => ({
  shipping: {
    custom_labels: {
      "ne-correios-sedex": "Mi etiqueta personalizada",
    },
  },
}));
```

## `ui:slot:set`

Disparado por la `app` para configurar el contenido de un slot de UI.

```tsx
import type { NubeSDK } from "@tiendanube/nube-sdk-types";
import { Row, Text } from "@tiendanube/nube-sdk-jsx";

function MyComponent() {
  return (
    <Row>
      <Text>¡Hola!</Text>
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

También se puede usar para eliminar el contenido de un slot, especificando `undefined` como contenido.

```typescript title="Example"
nube.send("ui:slot:set", () => ({
  ui: {
    slots: {
      before_line_items: undefined,
    },
  },
}));
```
