# Pensando para Devs

Desenvolver com o NubeSDK é fácil, rápido e prazeroso. Pensamos em cada detalhe da experiência do desenvolvedor para que você possa criar funcionalidades poderosas sem se preocupar com o funcionamento interno da plataforma.

## CLI para começar rápido

Com um único comando, você pode criar uma aplicação pronta para rodar:

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

Nosso CLI oferece três templates pensados para diferentes tipos de projetos:
- **Minimal**: Para apps que apenas escutam e emitem eventos.
- **Minimal com UI**: Crie interfaces com funções declarativas.
- **Minimal com UI em JSX**: Escreva interfaces com JSX

---

## Tipagem forte e DX moderna

O pacote [`@tiendanube/nube-sdk-types`](https://www.npmjs.com/package/@tiendanube/nube-sdk-types) fornece uma tipagem completa para todos os eventos, dados e APIs do SDK — com autocomplete e documentação inline nos principais editores de código.

```ts
import type { NubeSDK } from "@tiendanube/nube-sdk-types";

export function App(nube: NubeSDK) {
  nube.on("checkout:ready", ({ store }) => {
    console.log(`Bem-vindo à loja ${store.name}`);
  });
}
```

---

## UI com JSX ou funções declarativas

A UI no NubeSDK é definida como dados — você pode construí-la com JSX (usando o [`@tiendanube/nube-sdk-jsx`](https://www.npmjs.com/package/@tiendanube/nube-sdk-jsx)) ou com funções declarativas ([`@tiendanube/nube-sdk-ui`](https://www.npmjs.com/package/@tiendanube/nube-sdk-ui)). Ambas abordagens são equivalentes e compatíveis com o renderizador da plataforma.

::: code-group

```tsx [JSX]
import { Box, Text } from "@tiendanube/nube-sdk-jsx";

<Box padding="16px" background="var(--primary-color)">
  <Text>Hello, NubeSDK!</Text>
</Box>;

```

```typescript [Declarative]
import { box, text } from "@tiendanube/nube-sdk-ui";

box({
  padding: "16px",
  background: "var(--primary-color)",
  children: [text({ children: "Hello, NubeSDK!" })],
});
```
:::

Esses pacotes estão em constante evolução — novos componentes como `button`, `field`, `checkbox` e `textarea` são adicionados com frequência, permitindo experiências ricas sem reinventar a roda.

---

## Comunicação simples via eventos

Toda integração com o checkout e a loja é feita por eventos. Você pode escutar ações do usuário ou do sistema, e reagir com renderizações, validações e atualizações de estado:

```ts
nube.on("cart:update", ({ cart }) => {
  console.log(`Carrinho com ${cart.items.length} itens`);
});

nube.send("cart:add", () => ({
  cart: {
    items: [{ variant_id: 123, quantity: 2 }],
  },
}));
```

Esse modelo baseado em eventos é leve, reativo e escalável — e permite que seu app funcione de forma previsível, mesmo com outros apps rodando ao mesmo tempo.

## Escreva código que você se orgulha

Acreditamos que um bom código vai além de funcionar — ele deve ser fácil de manter, testável e confiável.

Para incentivar isso, os templates do NubeSDK já vêm configurados com ferramentas modernas de análise estática e testes automatizados:

- [Biome](https://biomejs.dev/) — para lint e formatação com zero configuração.
- [Vitest](https://vitest.dev/) — para testes unitários rápidos, com suporte a TypeScript e JSX.
- Exemplos prontos de testes — que mostram como validar a lógica da sua app desde o primeiro commit.

Esse setup ajuda a garantir consistência, identificar problemas cedo e aumentar a confiança na evolução do seu código — especialmente quando sua app cresce ou recebe novas funcionalidades.

---

Com o NubeSDK, você desenvolve com ferramentas modernas, tipagem completa, componentes reutilizáveis e integração segura com a plataforma. Criamos esse ambiente para que a **inovação esteja nas suas mãos — com simplicidade e confiança**.
