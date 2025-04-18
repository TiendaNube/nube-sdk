# Confirmação de idade

Neste exemplo vamos criar um aplicativo que adiciona um [checkbox](/pt/docs/components/checkbox) ao checkout para que o usuário confirme que tem mais de 18 anos.

## Setup do projeto

Certifique-se de ter o [Node.js®](https://nodejs.org/pt) na versão 16 ou superior instalado em seu computador.

Vamos começar criando estrutura inicial do projeto com o CLI do NubeSDK, fazer isso execute o comando:

```bash
npm create nube-app@latest
```
::: tip
Se for a primeira vez que está utilizando o CLI ou uma nova versão estiver disponível uma será solicitada a confirmação para instalação, apenas pressione `y` para prosseguir.
:::

Nas opções que aparecem a seguir defini o nome do app como `age-confirmation` e escolhi o template com `JSX`.

![CLI output](/images/examples/age-app-cli.png)

Como editor de código recomendamos o [VS Code](https://code.visualstudio.com/), então vamos usa-lo para abrir o projeto.

![install vscode extensions](/images/examples/age-app-vscode-1.png)

::: tip
Nossos templates possuiem extensões recomendadas para auxiliar no desenvolviento.
:::

![vscode recommended extensions](/images/examples/vscode-recommended.png)

## Inicialização do aplicativo

Nosso aplicativo precisa informar a loja que está encarregado de realizar uma validação do checkout, então vamos começar editando o arquivo `src/main.tsx` removendo o que vem no template e adicionando essa configuração inicial.

```tsx
import type { NubeSDK } from "@tiendanube/nube-sdk-types";
import { MyCustomField } from "./components/MyCustomField"; // [!code --]

export function App(nube: NubeSDK) {
  nube.send("ui:slot:set", () => ({ // [!code --]
    ui: { // [!code --]
      slots: { // [!code --]
        after_line_items: <MyCustomField />, // [!code --]
      }, // [!code --]
    }, // [!code --]
  })); // [!code --]
  nube.send("config:set", () => ({ // [!code ++]
    config: { // [!code ++]
      has_cart_validation: true, // [!code ++]
    }, // [!code ++]
  })); // [!code ++]
}
```

## Bloqueio do checkout

Para garantir que o usuário só possa prosseguir com a compra depois de confirmar a idade, assim que o checkout iniciar vamos marcar o carrinho como "invalido".

Primeiro vamos criar uma validação para garantir que o cliente está na pagina inicial do checkout, vou criar um arquivo em `src/utils/page.ts` para essa função.

```tsx
import type { AppLocation } from "@tiendanube/nube-sdk-types";

export function isStartPage(location: AppLocation) {
  return location.page.type === "checkout" && location.page.data.step === "start";
}
```

Agora podemos usar essa validação no arquivo `main.tsx` vamos exigir a confirmação no carrinho com o evento [`cart:validate`](/pt/docs/events#cart-validate).

```tsx
import type { NubeSDK } from "@tiendanube/nube-sdk-types";
import { isStartPage } from "./utils/page";

export function App(nube: NubeSDK) {
  nube.send("config:set", () => ({
    config: {
      has_cart_validation: true,
    },
  }));

  nube.on("checkout:ready", ({ location }) => {
    if(isStartPage(location)) { // [!code focus]
      nube.send("cart:validate", () => ({ // [!code focus]
        cart: { // [!code focus]
          validation: { // [!code focus]
            status: "fail", // [!code focus]
            reason: "Produto apenas para maiores de 18 anos", // [!code focus]
          }, // [!code focus]
        }, // [!code focus]
      })); // [!code focus]
    } // [!code focus]
  });
}
```

::: tip
O evento `checkout:ready` dispara sempre que o cliente troca de pagina no checkout, assim garantimos que a verificação será executada mesmo se o usuário navegar entre as etapas do checkout.
:::

## Criando o componente de confirmação

Para que o usuário confirme sua idade, vamos usar um [Checkbox](/pt/docs/components/checkbox) que ao ser selecionado altera o estado de validação do carrinho.

Em `src/components/` crie um novo arquivo `AgeConfirmation.tsx`.

```tsx
import { Checkbox } from "@tiendanube/nube-sdk-jsx";

export function AgeConfirmation() {
  return (
    <Checkbox
      id="age-confirmation"
      name="age-confirmation"
      label="Tenho mais de 18 anos"
      checked={false}
    />
  );
}
```

Agora precisamos fazer com que ao ser selecionado o checkbox dispare um novo evento, a forma mais simples de fazer isso é recebendo uma instância do nube sdk como propriedade do componente.

```tsx
import { Checkbox } from "@tiendanube/nube-sdk-jsx";
import type { NubeSDK } from "@tiendanube/nube-sdk-types"; // [!code focus]

export type AgeConfirmationProps = { nube: NubeSDK }; // [!code focus]

export function AgeConfirmation({ nube }:AgeConfirmationProps) { // [!code focus]
  return (
    <Checkbox
      id="age-confirmation"
      name="age-confirmation"
      label="Tenho mais de 18 anos"
      checked={false}
    />
  );
}
```

Então criamos uma função para lidar com evento de seleção do checkbox.

```tsx
import { Checkbox } from "@tiendanube/nube-sdk-jsx";
import type { NubeSDK } from "@tiendanube/nube-sdk-types";

export type AgeConfirmationProps = { nube: NubeSDK };

export function AgeConfirmation({ nube }:AgeConfirmationProps) {
  return (
    <Checkbox
      id="age-confirmation"
      name="age-confirmation"
      label="Tenho mais de 18 anos"
      checked={false}
      onChange={({ value }) => {  // [!code focus]
        if (value) {  // [!code focus]
          nube.send("cart:validate", () => ({  // [!code focus]
            cart: { validation: { status: "success" } },  // [!code focus]
          }));  // [!code focus]
          return;  // [!code focus]
        } // [!code focus]
        // bloquear checkout checkbox não estiver marcada  // [!code focus]
        nube.send("cart:validate", () => ({  // [!code focus]
          cart: {   // [!code focus]
            validation: {  // [!code focus]
              status: "fail",  // [!code focus]
              reason: "Produto apenas para maiores de 18 anos", // [!code focus]
            },  // [!code focus]
          },  // [!code focus]
        })); // [!code focus]
      }}  // [!code focus]
    />
  );
}
```

## Adicionando o componente ao checkout

Com o componente criado podemos adiciona-lo na interface do checkout, isso pode ser feito disparando o evento `ui:slot:set` e informando em qual [slot](/pt/docs/ui-slots) o componente deve ser renderizado, para esse app acho que `after_contact_form` é boa escolha.

Edite o arquivo `main.tsx` para incluir o componente no local escolhido.

```tsx
import type { NubeSDK } from "@tiendanube/nube-sdk-types";
import { isStartPage } from "./utils/page";
import { AgeConfirmation } from "./components/AgeConfirmation";  // [!code focus]

export function App(nube: NubeSDK) {
  nube.send("config:set", () => ({
    config: {
      has_cart_validation: true,
    },
  }));

  nube.on("checkout:ready", ({ location }) => {
    if(isStartPage(location)) {
      nube.send("cart:validate", () => ({
        cart: {
          validation: {
            status: "fail",
            reason: "Produto apenas para maiores de 18 anos",
          },
        },
      }));

      nube.send("ui:slot:set", () => ({ // [!code focus]
        ui: {  // [!code focus]
          slots: {  // [!code focus]
            after_contact_form: <AgeConfirmation nube={nube} />  // [!code focus]
          }  // [!code focus]
        }  // [!code focus]
      }));  // [!code focus]
    }
  });
}
```

## Executando o app

Caso você ainda não tenha um aplicativo criado, acesso o Portal do Parcero e siga as instruções para [cadastrar o seu primeiro app](https://dev.tiendanube.com/pt/docs/applications/overview#criando-um-aplicativo-na-nuvemshop).

![adicionar script](/images/nube-sdk-flag.png)

Você pode ativar o `modo de desenvolvedor` para executar o seu aplicativo localmente, nosso template já inclui um live server para te ajudar nessa tarefa, use o comando a seguir:

```bash
npm run dev
```

Seu aplicativo estará disponível em http://localhost:8080/main.min.js, basta colar essa url no portal do parceiro para ver seu app em funcionamento.

Quando quiser publicar a versão final, use o comando:

```bash
npm run build
```

Ele irá criar uma versão otimizada do seu script em `dist/main.min.js` que pode ser publicada no portal do parceiro.

::: info **Sobre testes unitários**

Para manter este guia objetivo e focado no fluxo principal de desenvolvimento, não abordamos testes automatizados neste tutorial.
No entanto, recomendamos fortemente que todos os apps desenvolvidos com o NubeSDK incluam testes unitários, especialmente para componentes e lógicas de validação.

Todos os templates do SDK já vêm configurados com [Vitest](https://vitest.dev/), o mesmo framework usado internamente pela nossa equipe. Em breve, publicaremos um guia específico sobre como testar aplicativos NubeSDK — com exemplos, boas práticas e cobertura de casos comuns.
:::


## Conclusão

Com esse exemplo simples, mostramos como é possível criar um app com o NubeSDK que interage com o checkout de maneira segura, modular e declarativa.

A partir de um requisito real — bloquear a finalização da compra até que o cliente confirme sua idade — exploramos os principais conceitos da plataforma:

- **Slots de UI:** renderização declarativa de componentes sem acesso direto ao DOM.
- **Eventos reativos:** controle do fluxo do checkout usando eventos como `checkout:ready` e `cart:validate`.
- **Execução isolada:** toda lógica do app roda em um ambiente protegido (Web Worker), o que garante segurança e previsibilidade.

Esse tutorial é apenas o ponto de partida. O NubeSDK oferece uma base sólida para desenvolver experiências avançadas e personalizadas em lojas Nuvemshop, como campanhas de cross-sell, aplicações de cupons, seleção de frete e muito mais — tudo com foco em segurança, performance e compatibilidade com o tema da loja.

Explore a [nossa documentação](/pt/docs/motivation) e continue construindo com o NubeSDK 🚀