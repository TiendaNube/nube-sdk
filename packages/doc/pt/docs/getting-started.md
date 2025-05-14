# Comece Agora

::: warning
Este SDK está em desenvolvimento! Todos os recursos estão sujeitos a mudanças.

No momento o uso do NubeSDK está **disponível apenas nas páginas do checkout**.
:::

## Gerando seu primeiro app

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
O NubeSDK requer Node >=v16.0.0
:::

### Escolha o melhor template para você

Nosso CLI oferece 3 templates diferentes para atender cada tipo de projeto.

![create-nube-app output](/images/create-nube-app.png)

- `Minimal` - Perfeito para apps sem interface que apenas escutam eventos e integram com serviços externos.
- `Minimal with UI` - Crie interfaces programaticamente com funções declarativas, ideal para apps que definem UI via API.
- `Minimal with UI in JSX` - Permite usar JSX para criar componentes de UI, sendo familiar para desenvolvedores frontend.

### Crie seu app no Portal de Parceiros

Siga a [documentação geral](https://dev.tiendanube.com/pt/docs/applications/overview) para criar seu app no [Portal de Parceiros](https://partners.nuvemshop.com.br/).

## Comece sua funcionalidade

A função `App` no arquivo `main.ts` (ou `main.tsx`) é o ponto de entrada da sua aplicação. É através dela que você acessa a instância do NubeSDK.

```ts{3}
import type { NubeSDK } from "@tiendanube/nube-sdk-types";

export function App(nube: NubeSDK) {
  // seu código aqui!
}
```

Agora você pode começar a desenvolver seu app, [criando componentes](/pt/docs/components) e [tratando eventos](/pt/docs/events) disparados pelo SDK.

## Mais qualidade e segurança

Todos os templates vêm pré-configurados com [Vitest](https://vitest.dev/) para testes unitários e [Biome](https://biomejs.dev/) para lint e formatação — as mesmas ferramentas que usamos no desenvolvimento do NubeSDK.

Para verificar o lint do seu código:

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

Para formatar o código:

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

Para rodar os testes:

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

Modo observação:

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

Cobertura de testes:

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

## Rode seu app localmente

Os templates incluem um servidor local para facilitar o teste da aplicação. Para iniciar:

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

O servidor estará disponível em `http://localhost:8080`, com sourcemaps para depuração.

Agora você pode testar o app usando o modo desenvolvedor no portal de parceiros.

:::tip
Não se esqueça de marcar a opção **Usar NubeSDK**.
:::

## Gere sua versão de produção

Todos os templates já usam [tsup](https://tsup.egoist.dev) para gerar o bundle otimizado. Execute:

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

O arquivo final será salvo em `./dist/main.min.js`.

## Publique seu app

Adicionar o script na aplicação segue o mesmo processo que qualquer outro. A única diferença é ativar a flag "Usa NubeSDK" ao criar o script — senão ele será carregado como um script clássico e não funcionará corretamente.

![NubeSDK Flag](/images/nube-sdk-flag.png)

--

## Configuração manual (avançado)

::: warning
Recomendamos fortemente usar o CLI `create-nube-app`, que fornece templates com scripts de build e ferramentas de desenvolvimento já configuradas.
:::

Se você não puder usar o CLI, é possível configurar seu projeto manualmente.

### 1. Instale as dependências

Para acessar os tipos do NubeSDK:

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

Se seu app tiver interface:

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

Se quiser usar JSX:

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

### 2. Crie o ponto de entrada

Crie um arquivo `main.ts` (ou `main.tsx`) com a função `App`:

```ts
// src/main.ts
import type { NubeSDK } from "@tiendanube/nube-sdk-types";

export function App(nube: NubeSDK) {
  // seu código aqui!
}
```

### 3. Configure o TypeScript

Exemplo de `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "jsx": "react-jsx",
    "jsxImportSource": "@tiendanube/nube-sdk-jsx/dist" // apenas se usar JSX
  }
}
```

### 4. Configure o bundler

Recomendamos usar o [tsup](https://tsup.egoist.dev/), que já vem nos templates oficiais:

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

Crie o arquivo `tsup.config.js`:

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
    // apenas se usar JSX
    options.alias = {
      "@tiendanube/nube-sdk-jsx/dist/jsx-runtime": "@tiendanube/nube-sdk-jsx/jsx-runtime"
    };
  },
  outExtension: ({ options }) => ({
    js: options.minify ? ".min.js" : ".js"
  })
});
```

### 5. Compile sua aplicação

Para gerar a versão de produção:

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

O arquivo final será gerado em `./dist/main.min.js`.
