# Pensado para Desarrolladores

Desarrollar con NubeSDK es fácil, rápido y agradable. Pensamos en cada detalle de la experiencia del desarrollador para que puedas crear funcionalidades potentes sin preocuparte por el funcionamiento interno de la plataforma.

## CLI para empezar rápido

Con un solo comando, podés crear una aplicación lista para funcionar:

::: code-group

```bash [npm]
npm create nube-app@latest
```

```bash [yarn]
yarn create nube-app
```

```bash [pnpm]
pnpm create nube-app
```

```bash [bun]
bun create nube-app
```

:::

Nuestro CLI ofrece tres plantillas según el tipo de proyecto:
- **Minimal**: Para apps que solo escuchan y emiten eventos.
- **Minimal con UI**: Interfaces con funciones declarativas.
- **Minimal con UI en JSX**: Interfaces usando JSX.

---

## Tipado fuerte y DX moderna

El paquete [`@tiendanube/nube-sdk-types`](https://www.npmjs.com/package/@tiendanube/nube-sdk-types) proporciona tipos completos para todos los eventos, datos y APIs del SDK — con autocompletado y documentación inline en tu editor favorito.

```ts
import type { NubeSDK } from "@tiendanube/nube-sdk-types";

export function App(nube: NubeSDK) {
  nube.on("checkout:ready", ({ store }) => {
    console.log(`Bienvenido a la tienda ${store.name}`);
  });
}
```

---

## UI con JSX o funciones declarativas

La UI en NubeSDK se define como datos — podés usar JSX (con [`@tiendanube/nube-sdk-jsx`](https://www.npmjs.com/package/@tiendanube/nube-sdk-jsx)) o funciones declarativas ([`@tiendanube/nube-sdk-ui`](https://www.npmjs.com/package/@tiendanube/nube-sdk-ui)). Ambas opciones son compatibles con el renderizador de la plataforma.

::: code-group

```tsx [JSX]
import { Box, Text } from "@tiendanube/nube-sdk-jsx";

<Box padding="16px" background="var(--primary-color)">
  <Text>¡Hola, NubeSDK!</Text>
</Box>;
```

```typescript [Declarative]
import { box, text } from "@tiendanube/nube-sdk-ui";

box({
  padding: "16px",
  background: "var(--primary-color)",
  children: [text({ children: "¡Hola, NubeSDK!" })],
});
```
:::

Estos paquetes evolucionan constantemente — se agregan nuevos componentes como `button`, `field`, `checkbox` y `textarea` para enriquecer la experiencia sin reinventar la rueda.

---

## Comunicación simple basada en eventos

Toda integración con el checkout y la tienda se hace mediante eventos. Podés escuchar acciones del usuario o del sistema, y responder con actualizaciones en la interfaz o validaciones:

```ts
nube.on("cart:update", ({ cart }) => {
  console.log(`Carrito con ${cart.items.length} productos`);
});

nube.send("cart:add", () => ({
  cart: {
    items: [{ variant_id: 123, quantity: 2 }],
  },
}));
```

Este modelo basado en eventos es liviano, reactivo y escalable — y permite que tu app funcione de forma predecible, incluso con múltiples apps en simultáneo.

## Escribí código del que te sientas orgulloso

Creemos que un buen código no solo debe funcionar — debe ser mantenible, testeable y confiable.

Por eso, los templates de NubeSDK ya vienen configurados con herramientas modernas para análisis estático y pruebas automatizadas:

- [Biome](https://biomejs.dev/) — para linting y formateo sin configuración.
- [Vitest](https://vitest.dev/) — para pruebas unitarias rápidas con soporte a TypeScript y JSX.
- Ejemplos de tests listos — para validar la lógica de tu app desde el primer día.

Este setup ayuda a mantener la consistencia, detectar problemas temprano y desarrollar con confianza.

---

Con NubeSDK, desarrollás con herramientas modernas, tipos robustos, componentes reutilizables e integración segura con la plataforma. Creamos este entorno para que **la innovación esté en tus manos — con simplicidad y confianza**.
