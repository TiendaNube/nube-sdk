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

![create-nube-app output](/create-nube-app.png)

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

Agora você pode começar a desenvolver seu app, [criando componentes](/ui) e [tratando eventos](/handling-events) disparados pelo SDK.

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

![NubeSDK Flag](https://dev.tiendanube.com/assets/images/nube-sdk-flag-8a3ffa9b1883833c23c08aadca011586.png)
