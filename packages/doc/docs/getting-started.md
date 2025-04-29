# Getting Started

::: warning
This SDK is a Work In Progress! All features are subject to change.

Currently, the use of NubeSDK is **only available on the checkout pages**.
:::

## Scaffolding Your First App

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
NubeSDK requires Node >=v16.0.0
:::

### Select the best template for you

Our CLI provides 3 different templates to suit every type of project.

![create-nube-app output](/images/create-nube-app.png)

- `Minimal` - It's perfect for headless apps that just need to handle events and integrate with external services.
- `Minimal with UI` - Create interfaces programmatically with declarative functions, ideal for apps that need to define user interfaces via API.
- `Minimal with UI in JSX` - It allows you to use JSX to create UI components, making the work familiar to web developers accustomed to modern front-end frameworks.

### Create your app in the Patners Portal

Follow the [general documentation](https://dev.tiendanube.com/en/docs/applications/overview) of app management to create your app in the [Partners Portal](https://partners.nuvemshop.com.br/).

## Starting your feature

The `App` function in the `main.ts` (or `main.tsx`) file is the entry point for your application, and it is through it that you have access to the NubeSDK instance.

```ts{3}
import type { NubeSDK } from "@tiendanube/nube-sdk-types";

export function App(nube: NubeSDK) {
  // your code here!
}
```

Now you can start developing your app, [creating components](/docs/components) and [handling events](/docs/events) triggered by the SDK.

## More quality and security

All templates come preconfigured with [Vitest](https://vitest.dev/) for creating unit tests and [Biome](https://biomejs.dev/) for lint and formatting, the same tools we use to develop NubeSDK.

To lint your code use:

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

To format all source code:

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

To run the unit tests:

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

If you prefer to run your tests in watch mode:

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

to check the code coverage use:

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

## Run your app locally

The templates include a local server that helps you test your application, to start it use the command:

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

The dev server will be started at `http://localhost:8080` and will provide a script with embedded sourcemap for easy debugging.

Now you can use the developer mode in the partiners portal.

:::tip
Don't forget to check the **Use NubeSDK** option.
:::

## Build your app

All templates already have [tsup](https://tsup.egoist.dev) to generate a bundle optimized for production. Run the command:

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

The optimized script will be generated in `./dist/main.min.js`.

## Ship the new app

Adding the script to your application has the same process that with any other script, the only difference is that you have to enable the Uses Nube SDK flag in the script creation screen, otherwise it will loaded as a classic script and it will fail to work as expected.

![NubeSDK Flag](/images/nube-sdk-flag.png)

--

## Manual Setup (Advanced)

::: warning
We strongly recommend using the `create-nube-app` CLI, which provides templates with pre-configured build scripts and development tools.
:::

If you can't use the CLI, you can manually configure your project.

### 1. Install the dependencies

To access NubeSDK types:

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

If your app has a UI:

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

If you want to use JSX:

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

### 2. Create the app entrypoint

Create a `main.ts` (or `main.tsx`) file with the `App` function:

```ts
// src/main.ts
import type { NubeSDK } from "@tiendanube/nube-sdk-types";

export function App(nube: NubeSDK) {
  // your code here!
}
```

### 3. Configure the typescript options

Example `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "jsx": "react-jsx",
    "jsxImportSource": "@tiendanube/nube-sdk-jsx/dist" // only if you use JSX
  }
}
```

### 4. Configure the bundler

We recommend using [tsup](https://tsup.egoist.dev/), which is already included in official templates:

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

Create a `tsup.config.js` file:

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
    // only if you use JSX
    options.alias = {
      "@tiendanube/nube-sdk-jsx/dist/jsx-runtime": "@tiendanube/nube-sdk-jsx/jsx-runtime"
    };
  },
  outExtension: ({ options }) => ({
    js: options.minify ? ".min.js" : ".js"
  })
});
```

### 5. Build your app

To build the production version:

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

The final file will be generated at `./dist/main.min.js`.
