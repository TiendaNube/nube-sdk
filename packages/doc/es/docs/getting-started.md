# Empezar Ahora

::: warning
¡Este SDK está en desarrollo! Todas las funcionalidades están sujetas a cambios.

Actualmente, el uso de NubeSDK **solo está disponible en las páginas de pago**.
:::

## Crear tu primer app

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

:::tip
NubeSDK requiere Node >=v16.0.0
:::

### Elegí el mejor template para vos

El CLI ofrece 3 templates diferentes para adaptarse a cada tipo de proyecto.

![create-nube-app output](/create-nube-app.png)

- `Minimal` - Ideal para apps sin UI que manejan eventos e integran con servicios externos.
- `Minimal with UI` - Creá interfaces de manera declarativa, perfecto si querés controlar la UI desde la API.
- `Minimal with UI in JSX` - Usá JSX para crear componentes visuales como lo harías en React u otros frameworks modernos.

### Creá tu app en el Portal de Partners

Seguí la [documentación general](https://dev.tiendanube.com/es/docs/applications/overview) para crear tu app en el [Portal de Partners](https://partners.nuvemshop.com.br/).

## Empezá a construir tu funcionalidad

La función `App` en el archivo `main.ts` (o `main.tsx`) es el punto de entrada de tu aplicación y el acceso principal al NubeSDK.

```ts{3}
import type { NubeSDK } from "@tiendanube/nube-sdk-types";

export function App(nube: NubeSDK) {
  // ¡tu código acá!
}
```

Ahora podés empezar a desarrollar tu app, [creando componentes](/ui) y [manejando eventos](/handling-events) del SDK.

## Más calidad y seguridad

Todos los templates vienen listos con [Vitest](https://vitest.dev/) para pruebas unitarias y [Biome](https://biomejs.dev/) para lint y formateo — las mismas herramientas que usamos en el desarrollo del NubeSDK.

Lint del código:

::: code-group

```bash [npm]
npm run lint
```

```bash [yarn]
yarn lint
```

```bash [pnpm]
pnpm lint
```

```bash [bun]
bun run lint
```

:::

Formateo automático:

::: code-group

```bash [npm]
npm run format
```

```bash [yarn]
yarn format
```

```bash [pnpm]
pnpm format
```

```bash [bun]
bun run format
```

:::

Pruebas unitarias:

::: code-group

```bash [npm]
npm test
```

```bash [yarn]
yarn test
```

```bash [pnpm]
pnpm test
```

```bash [bun]
bun test
```

:::

Modo watch:

::: code-group

```bash [npm]
npm run test:watch
```

```bash [yarn]
yarn test:watch
```

```bash [pnpm]
pnpm test:watch
```

```bash [bun]
bun run test:watch
```

:::

Cobertura:

::: code-group

```bash [npm]
npm run test:coverage
```

```bash [yarn]
yarn test:coverage
```

```bash [pnpm]
pnpm test:coverage
```

```bash [bun]
bun run test:coverage
```

:::

## Ejecutá tu app localmente

Los templates incluyen un servidor local para testeo. Para iniciarlo:

::: code-group

```bash [npm]
npm run dev
```

```bash [yarn]
yarn dev
```

```bash [pnpm]
pnpm dev
```

```bash [bun]
bun run dev
```

:::

El servidor corre en `http://localhost:8080` con sourcemaps para debug más fácil.

Podés usar el modo desarrollador desde el portal de partners.

:::tip
Asegurate de activar la opción **Usa NubeSDK**.
:::

## Compilá tu app para producción

Usamos [tsup](https://tsup.egoist.dev) para generar un bundle optimizado. Ejecutá:

::: code-group

```bash [npm]
npm run build
```

```bash [yarn]
yarn build
```

```bash [pnpm]
pnpm build
```

```bash [bun]
bun run build
```

:::

El archivo generado estará en `./dist/main.min.js`.

## Publicá tu app

Agregar el script sigue el mismo proceso de cualquier otro. La diferencia es que tenés que activar la bandera "Usa NubeSDK" al crear el script. Si no, será cargado como un script clásico y fallará.

![NubeSDK Flag](https://dev.tiendanube.com/assets/images/nube-sdk-flag-8a3ffa9b1883833c23c08aadca011586.png)
