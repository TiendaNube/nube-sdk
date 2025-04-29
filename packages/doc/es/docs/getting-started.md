# Empezar Ahora

::: warning
¡Este SDK está en desarrollo! Todas las funcionalidades están sujetas a cambios.

Actualmente, el uso de NubeSDK **solo está disponible en las páginas de checkout**.
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

![create-nube-app output](/images/create-nube-app.png)

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

Ahora podés empezar a desarrollar tu app, [creando componentes](/es/docs/components) y [manejando eventos](/es/docs/events) del SDK.

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

![NubeSDK Flag](/images/nube-sdk-flag.png)

--

## Configuración manual (avanzada)

::: warning
Recomendamos encarecidamente usar el CLI `create-nube-app`, que proporciona plantillas con scripts de compilación y herramientas de desarrollo preconfiguradas.
:::

Si no puedes usar el CLI, puedes configurar tu proyecto manualmente.

### 1. Instalar las dependencias

Para acceder a los tipos de NubeSDK:

::: code-group

```bash [npm]
npm install -D typescript @tiendanube/nube-sdk-types
```

```bash [yarn]
yarn add -D typescript @tiendanube/nube-sdk-types
```

```bash [pnpm]
pnpm add -D typescript @tiendanube/nube-sdk-types
```

```bash [bun]
bun add -D typescript @tiendanube/nube-sdk-types
```

:::

Si tu app tiene una interfaz:

::: code-group

```bash [npm]
npm install @tiendanube/nube-sdk-ui
```

```bash [yarn]
yarn add @tiendanube/nube-sdk-ui
```

```bash [pnpm]
pnpm add @tiendanube/nube-sdk-ui
```

```bash [bun]
bun add @tiendanube/nube-sdk-ui
```

:::

Si deseas usar JSX:

::: code-group

```bash [npm]
npm install @tiendanube/nube-sdk-jsx
```

```bash [yarn]
yarn add @tiendanube/nube-sdk-jsx
```

```bash [pnpm]
pnpm add @tiendanube/nube-sdk-jsx
```

```bash [bun]
bun add @tiendanube/nube-sdk-jsx
```

:::

### 2. Crear el punto de entrada de la aplicación

Crea un archivo `main.ts` (o `main.tsx`) con la función `App`:

```ts
// src/main.ts
import type { NubeSDK } from "@tiendanube/nube-sdk-types";

export function App(nube: NubeSDK) {
  // ¡tu código aquí!
}
```

### 3. Configurar las opciones de TypeScript

Ejemplo de `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "jsx": "react-jsx",
    "jsxImportSource": "@tiendanube/nube-sdk-jsx/dist" // solo si usas JSX
  }
}
```

### Configurar el empaquetador

Recomendamos usar [tsup](https://tsup.egoist.dev/), que ya viene incluido en las plantillas oficiales:

::: code-group

```bash [npm]
npm install -D tsup
```

```bash [yarn]
yarn add -D tsup
```

```bash [pnpm]
pnpm add -D tsup
```

```bash [bun]
bun add -D tsup
```

:::

Crea el archivo `tsup.config.js`:

```js
// tsup.config.js
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/main.tsx"],
  format: ["esm"],
  target: "esnext",
  clean: true,
  minify: true,
  bundle: true,
  sourcemap: false,
  splitting: false,
  skipNodeModulesBundle: false,
  esbuildOptions(options) {
    // solo si usas JSX
    options.alias = {
      "@tiendanube/nube-sdk-jsx/dist/jsx-runtime": "@tiendanube/nube-sdk-jsx/jsx-runtime"
    };
  },
  outExtension: ({ options }) => ({
    js: options.minify ? ".min.js" : ".js"
  })
});
```

### 5. Compilar la aplicación

Para generar la versión de producción:

::: code-group

```bash [npm]
npx tsup
```

```bash [yarn]
yarn tsup
```

```bash [pnpm]
pnpm tsup
```

```bash [bun]
bunx tsup
```

:::

El archivo final se generará en `./dist/main.min.js`.
