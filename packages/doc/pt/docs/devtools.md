# Visão Geral do DevTools

O Nube DevTools é uma extensão do Chrome desenvolvida para melhorar o processo de depuração e monitoramento de aplicações construídas com o NubeSDK.

Instale o Nube DevTools pela [Chrome Web Store](https://www.google.com).

Você pode abrir o DevTools do Chrome em qualquer página da web pressionando `F12` ou `Ctrl+Shift+I` (Windows ou Linux) e `Fn+F12` ou `Cmd+Option+I` (Mac).
Após abrir o DevTools e instalar o Nube DevTools, você encontrará uma nova aba chamada "NubeSDK".

![devtools apps](/devtools-apps.png)

# Abra sua aplicação

Quando você abrir a extensão, verá algumas seções adicionais.

| Seções                                 | Detalhes |
|:---                                      |:---     |
| [Apps](devtools#components) | Exibe uma lista detalhada dos apps construídos usando o NubeSDK, fornecendo informações sobre seu estado atual e atividades em andamento. |
| [Components](devtools#components) | Fornece uma visão abrangente de todos os Componentes e seus slots disponíveis, permitindo que os desenvolvedores inspecionem e gerenciem configurações de componentes. |
| [Events](devtools#events) | Mostra todos os eventos trocados entre os apps e a página principal, facilitando o rastreamento de comunicações e análise de estado do Nube SDK. |
| [Armazenamento](devtools#storage) | Registra interações entre `localStorage` e `sessionStorage`, permitindo o monitoramento de alterações de dados e acessos. |

## Apps

Esta seção exibe uma lista detalhada de apps construídos usando o NubeSDK. A lista também indica se um aplicativo está sendo executado no modo de desenvolvimento.

![devtools apps](/devtools-apps.png)

Quando você clica em um aplicativo individual na seção Apps, você verá detalhes adicionais sobre esse aplicativo:

- **ID:** Um identificador único para a instância específica do aplicativo.
- **Regitered:** Indica se o app foi registrado com sucesso.
- **Script:** Exibe o script que está sendo executado para o aplicativo.

Para mais detalhes sobre como executar seu aplicativo localmente e explorar esses recursos, consulte a seção [Execute seu aplicativo localmente](getting-started#run-your-app-locally).

## Components

Esta seção fornece uma visão abrangente de todos os componentes renderizados pelos apps NubeSDK, agrupados por aplicativo e organizados por sua localização na interface (slots). Isso facilita o entendimento de como cada aplicativo constrói sua interface e onde cada elemento está posicionado.

![devtools components](/devtools-components.png)

Para cada componente, você pode:

* **Inspecionar sua estrutura:** Visualizar a árvore de componentes e elementos aninhados.
* **Ver o tipo do componente:** Como Box, Button, Text, Field e outros.
* **Explorar slots:** Ver quais componentes são renderizados em quais slots de UI predefinidos, como `before_main_content` ou `after_line_items`.

## Events

Esta seção registra e exibe todos os eventos trocados entre os aplicativos e a página principal em tempo real. Ajuda os desenvolvedores a monitorar a sequência de eventos, entender como os aplicativos interagem com o NubeSDK e diagnosticar problemas inspecionando as transições de estado conforme elas ocorrem.

![devtools events](/devtools-events.png)

Na tela de eventos, você pode ver o nome de cada evento. Quando você clica em um evento individual, a visualização detalhada revela o estado do NubeSDK naquele momento.

## Storage

Esta seção exibe uma lista de todos os eventos relacionados a armazenamento ocorrendo em tempo real, capturando interações com `localStorage` e `sessionStorage`. Ao selecionar um evento específico, são exibidas informações detalhadas como o método utilizado, a chave e o valor associados ao evento.

![devtools storage](/devtools-storage.png)

Para mais informações sobre como acessar as API's do navegador para `localStorage` e `sessionStorage`, consulte a documentação [Browser API's](browser-apis).
