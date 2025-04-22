# APIs do Navegador

O NubeSDK fornece uma interface segura e padronizada para interagir com recursos comuns do navegador dentro de Web Workers — um modelo de runtime usado para executar apps de parceiros com segurança, isolados da aplicação principal.

Como os Web Workers não têm acesso direto a muitos recursos padrão do navegador, o NubeSDK oferece o método `getBrowserAPIs()`, que expõe um conjunto de interfaces seguras e de alto nível que permitem que os apps de parceiros interajam com recursos selecionadas do navegador através de uma camada de API controlada e assíncrona.

Essas abstrações são alinhadas com os princípios do NubeSDK de segurança, consistência e experiência do desenvolvedor — permitindo integrações mais ricas sem sacrificar controle ou desempenho.

Recursos adicionais do navegador serão introduzidas ao longo do tempo, sempre seguindo esta filosofia de acesso seguro e transparente.

## Web Storage API

As APIs [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) e [sessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage) fazem parte do contexto `window` da thread principal e não estão disponíveis nativamente dentro de Web Workers.

Para fornecer acesso a esses mecanismos de armazenamento de forma segura e compatível, o NubeSDK expõe `asyncLocalStorage` e `asyncSessionStorage` através do método `getBrowserAPIs()`. Essas interfaces retornam `promises` e são projetadas para seguir o modelo de execução assíncrono do SDK.

### Como Usar

O próximo exemplo usa o método `setItem` do `asyncSessionStorage` para armazenar um novo valor.

```typescript
import type { NubeSDK } from "@tiendanube/nube-sdk-types";

export function App(nube: NubeSDK) {
  const browser = nube.getBrowserAPIs();

  browser.asyncSessionStorage
    .setItem("my_custom_field", "Hello World!")
    .then(() => {
      console.log("Item definido no armazenamento de sessão");
    });
}
```

O próximo exemplo usa o método `getItem` do `asyncSessionStorage` para recuperar um valor armazenado.

```typescript
import type { NubeSDK } from "@tiendanube/nube-sdk-types";

export function App(nube: NubeSDK) {
  const browser = nube.getBrowserAPIs();

  browser.asyncSessionStorage.getItem("my_custom_field").then((value) => {
    console.log("my_custom_field", value);
  });
}
```

### Tempo de Vida

Tanto `asyncLocalStorage` quanto `asyncSessionStorage` suportam um parâmetro opcional chamado `ttl` (time-to-live), que define por quanto tempo o valor armazenado deve permanecer válido, em segundos.

Quando fornecido, o `ttl` determina o tempo de expiração para a chave. Uma vez que a duração especificada tenha passado, o valor não será mais acessível via `getItem` e será tratado como se tivesse sido removido.

```typescript
// Armazenar um valor que expira em 60 segundos
await browser.asyncLocalStorage.setItem("my_custom_field", "Hello World!", 60);
```

Se nenhum `ttl` for fornecido, o valor persistirá indefinidamente, seguindo o comportamento padrão do `localStorage` e `sessionStorage`. 