# NubeSDK DevTools: análise de funcionalidades, experiência de uso e roadmap

> Versão analisada: `nube-devtools` 1.14.1 (branch `main`, outubro de 2026).
> Fontes: código da extensão em `packages/nube-devtools`, pontos de integração no `nube-sdk-internal` (`runtime/src/devtools.ts`, `register/src/attach.ts`, `register/src/worker/handler/telemetry/devtools.ts`, `register/src/overwrites.ts`), tipos públicos em `packages/types`, histórico de commits e issues/discussions do repositório público.

---

## 1. Sumário executivo

A NubeSDK DevTools evoluiu, em cerca de seis meses, de um visualizador de eventos para uma suíte com dez painéis que cobre o ciclo completo de um app: instalação (Apps, Local Mode), renderização (Components), comportamento (Events, State, Logs), persistência (Storage), integração com o host (API Calls) e desempenho (Performance). A arquitetura é sólida: a extensão conversa com o runtime por um hook dedicado (`__NUBE_SDK_DEVTOOLS_HOOK__`) que entrega `prev`/`next` de cada evento, mantém histórico para painéis abertos tarde e não custa nada para lojas sem a extensão.

Os principais problemas de experiência não estão nos painéis em si, e sim nas **bordas**: a primeira impressão (tela "Unavailable" sem diagnóstico), o idioma (100% inglês para um público majoritariamente brasileiro e hispano-falante), a ausência de documentação para o parceiro, o escopo global da instrumentação (todas as páginas HTTP, não só lojas) e a falta de um caminho para transformar o que a DevTools vê em um relatório de suporte. As issues abertas por parceiros confirmam isso: das cinco issues que citam a extensão, três são sobre "a DevTools diz que não está disponível" e uma é sobre a instrumentação global quebrar um script legado em loja sem SDK.

Em termos de produto, a maior oportunidade é mudar a DevTools de **observadora** para **participante**: hoje ela mostra o que aconteceu, mas quase não permite provocar cenários (enviar um evento com payload, simular um cliente logado, editar props de um componente, repetir uma chamada de API com outros parâmetros). Para quem desenvolve um app para checkout ou vitrine, provocar cenários sem depender de uma loja real é o que mais economiza tempo.

As recomendações estão priorizadas na seção 6 e organizadas em um roadmap na seção 7.

---

## 2. Como a extensão funciona hoje

### 2.1 Arquitetura

| Camada | Arquivo | Papel |
|---|---|---|
| Service worker | `src/background/service-worker.ts` | Registra os scripts injetados no MAIN world, aplica a regra de header `X-Nube-Devtools: true`, responde a mensagens do painel (checar status, injetar monitores, reenviar evento) e controla o badge do ícone. |
| Flag de presença | `public/inject-extension-flag.js` | Define `window.__NUBE_DEVTOOLS_EXTENSION__ = true` em `document_start`. O runtime só cria o hook de devtools quando essa flag existe. |
| Monitor de performance | `public/inject-performance-monitor.js` | Em `document_start`, intercepta `window.__NUBE_SDK_APPS__.push` para ouvir as mensagens de cada worker: `telemetry:traces` (fetch), `telemetry:metrics` (init e handlers lentos) e o primeiro `ui:slot:set` (first render). |
| Content script | `src/contentScript/index.ts` | Faz a ponte entre `CustomEvent`s da página e `chrome.runtime` ports. Um port longo para eventos (aberto pelo painel) e um port por lote para logs, storage, comandos e performance. |
| Instrumentação MAIN world | `src/background/scripts/*.ts` | Funções serializadas via `chrome.scripting.executeScript`: assinam o hook, patcham `Storage.prototype` e `nubeSDK.command.execute`, leem a árvore de componentes e desenham overlays. |
| Painel | `src/devtools/**` | React 18 + Tailwind 4 + Radix. Um provider por fonte de dados (`src/contexts/*`), páginas em `src/devtools/pages/*`. |
| Popup | `src/popup/**` | Reaproveita apenas o Local Mode. |

### 2.2 Contrato com o SDK

O runtime (`nube-sdk-internal/packages/runtime/src/devtools.ts`) procura o hook a cada `send`. Se a extensão instalou um hook antes do bundle carregar, o runtime usa esse; senão, cria o próprio quando vê a flag. O hook guarda eventos com `prev`, `next`, `payload`, `sender`, `target` e `seq`, e um canal paralelo de logs. O register espelha para esse canal:

- `console.error` dos workers (apenas `error`; `log`, `info`, `warn` e `debug` estão comentados em `overwrites.ts`);
- `unhandledrejection` e erros não capturados do worker;
- recusas do próprio SDK: navegação rejeitada, mensagem para iframe não montado, customização recusada, watch do Observer inválido, erro ao carregar o app (`worker-error`);
- erros em listeners, modifiers, entrypoint e `nube.api` **somente** quando a telemetria está habilitada no build.

O register também lê duas chaves de `sessionStorage` escritas pela extensão (`attach.ts`): `nube-devtools-application-server` (Local Mode: injeta um app novo ou troca o script de um existente) e `nube-devtools-blocked-apps` (remove apps do estado antes de registrar).

### 2.3 Limites e persistência

| Item | Valor | Observação |
|---|---|---|
| Buffer de eventos do runtime | 200 | `DEFAULT_MAX_RECORDS` no runtime |
| Buffer de eventos do hook instalado pela extensão | 1.000 | `MAX_EVENT_RECORDS`. O histórico disponível depende de quem instala o hook primeiro. |
| Buffer de logs | 500 (runtime) / 1.000 (extensão) | Mesma assimetria. |
| Comandos (`nube.api`) | 500 | Mantidos em `window.__NUBE_DEVTOOLS_COMMANDS__` |
| Performance | 1.000 | `window.__NUBE_DEVTOOLS_PERFORMANCE__` |
| Preferências do painel | `localStorage` do painel | Página atual, filtros de busca, larguras, direção dos painéis, banner dispensado. Globais, não por loja. |

---

## 3. Inventário de funcionalidades

### 3.1 Apps (`pages/apps.tsx`)
Lista os apps em `state.apps` com status do script, badges (Hosted, Local Mode, Replaced Script, Blocked), filtro por id/script, detalhe com id copiável, URL do script e o controle **Temporary block** (grava em `sessionStorage` e recarrega a aba). Apps bloqueados continuam listados mesmo quando o runtime não os reporta.

### 3.2 Local Mode (`pages/local-mode.tsx`, `components/local-mode-content.tsx`)
Dois modos: **New App** (gera um UUID e injeta o script) e **Existing App** (substitui o script de um app instalado). URL padrão `http://localhost:8080/main.min.js`. Faz até 10 tentativas (2 s) de `GET` ao script antes de recarregar a aba; o ícone da extensão ganha um badge "1" enquanto conectado. Também disponível no popup.

### 3.3 Components (`pages/components.tsx`, `utils/component-tree.ts`)
Árvore por slot com visão "Page" (merge de todos os apps) ou por app. Mostra tipo, props, `key`, DOM id, valor em `ui.values`, quantos hosts `[data-slot]` existem na página, badges "not mounted", "repeatable" e "N apps". Hover desenha overlay na página; ações de rolar até o elemento e abrir no painel Elements; selecionar um elemento no Elements seleciona o componente que o renderizou. Atualiza com debounce após cada evento. Tem testes unitários (`component-tree.spec.ts`, o único arquivo de teste do pacote).

### 3.4 Logs (`pages/logs.tsx`)
Lista com nível, fonte traduzida (ex.: `internal-command` vira "nube.api call"), app, evento e stack trace. Filtros por nível, fonte, app e texto. Tabela-resumo por app com contagem de erros/avisos. Exporta JSON e copia mensagem+stack. A sidebar mostra contadores de erro e aviso.

### 3.5 Events (`pages/events.tsx`)
Tabela sender/target/event com colunas redimensionáveis, filtro livre ou exato (`sender="…" target="…" event="…"`), menu de contexto (adicionar ao filtro, copiar, reenviar). Ao selecionar, mostra o `next` state com os caminhos alterados destacados (diff real `prev` vs `next` vindo do hook, não polling).

### 3.6 Storage (`pages/storages.tsx`)
Lista apenas chaves `app-<appId>-<key>` de `localStorage` e `sessionStorage`. Entende o envelope `{ value, ttl }` do SDK: edita só o `value`, preserva o TTL, marca entradas expiradas e avisa que o SDK as lê como ausentes. Atualização ao vivo via patch de `Storage.prototype` mais polling de 2 s enquanto o painel está visível. Permite editar e remover.

### 3.7 API Calls (`pages/api-calls.tsx`)
Toda chamada `nube.api.*` com escopo, comando, params, resultado ou erro, duração e status. Reconhece falhas "soft" (`{ ok: false, code, reason }`, padrão da Customization API) e as exibe como erro com explicação.

### 3.8 Performance (`pages/performance.tsx`)
Waterfall com entradas de rede (fetch do worker), chamadas de API, scripts (init, handlers lentos, long tasks) e lifecycle (first render). Classificação good / needs improvement / poor com budgets RAIL e Long Tasks. Resumo por app (first render, init, p95 de rede e de API, handler mais lento). Exporta JSON. Banner avisa que os tempos são medidos com DevTools anexado.

### 3.9 State (`pages/state.tsx`)
`getState()` via `inspectedWindow.eval`, re-executado a cada evento recebido, com destaque dos caminhos que mudaram entre leituras.

### 3.10 SVG Converter (`pages/svg-converter.tsx`, `utils/formatters.ts`)
Converte markup SVG em JSX `Svg.*` com substituições por regex e um formatador próprio. Copia ou baixa `SvgComponent.tsx`.

### 3.11 Transversais
- Tela **Unavailable** quando `window.nubeSDK` não existe (checado uma única vez ao montar).
- Header `X-Nube-Devtools: true` em toda navegação principal (todas as origens) para que o backend force o SDK na loja.
- Tema segue o DevTools do Chrome. Direção dos painéis (lado a lado / empilhado) persistida e automática em janelas estreitas.
- Panel recarrega quando o documento inspecionado muda (compara `performance.timeOrigin`), preservando histórico em navegações same-document.

---

## 4. Pontos fortes

- **Instrumentação de verdade, não polling.** O hook entrega `prev`/`next` por evento e replay de histórico; a extensão instala um hook de forward quando chega antes do runtime. Isso elimina a corrida de inicialização que costuma assombrar ferramentas desse tipo.
- **Custo zero para a loja sem extensão.** Dois property reads por `send`. Com a extensão, o custo é explícito (dois `jsonClone` por evento) e o banner do painel de Performance deixa isso claro.
- **Modelagem fiel ao SDK.** Storage entende o envelope com TTL; API Calls entende falhas `ok: false`; Components entende slots repetíveis, wrappers de merge e `ui.values`; Logs traduz as fontes internas para nomes que o parceiro reconhece.
- **Robustez em cenários de borda.** Reconexão de port, dedupe por `seq`, descarte de snapshot obsoleto quando uma mutação chega no meio da leitura, limites em todos os buffers, patches reversíveis a partir do console.
- **Código bem documentado.** Os comentários explicam o "porquê" de cada decisão, o que facilita manutenção por quem não escreveu.
- **Integração com o Elements panel** (selecionar `$0` seleciona o componente) é um diferencial raro em devtools de plataforma.

---

## 5. Problemas de experiência e oportunidades de melhoria

Ordenados pelo impacto na jornada do parceiro. Cada item aponta o arquivo relevante.

### 5.1 Primeira impressão: a tela "Unavailable" não ajuda a resolver

Issues #306, #231 e os comentários tardios em #306 mostram o mesmo padrão: o parceiro instala a extensão, abre a loja de teste e lê que o "NubeSDK é exclusivo de lojas Nuvemshop", mesmo estando em uma loja Nuvemshop. A causa real varia (loja sem SDK habilitado, nenhum app instalado no tema, script sem "Usa NubeSDK", SDK ainda não carregou), mas a tela não distingue nenhuma delas.

Agravantes em `pages/unavailable.tsx` e `hooks/use-nube-status.ts`:
- o status é checado uma única vez ao montar; se o runtime carregar depois do painel, a tela não muda até um reload manual;
- o texto fala em "Nuvemshop", confundindo quem está em domínio `mitiendanube.com`;
- o link aponta para `dev.nuvemshop.com.br/docs/...`, enquanto o README já padronizou `nuvemshop.dev`;
- não menciona que a própria extensão envia o header que força o SDK, nem o que fazer quando isso não basta (abrir ticket, pedir habilitação da loja).

### 5.2 Idioma

Toda a interface, tooltips, mensagens de erro e dicas estão em inglês. O público é majoritariamente Brasil, Argentina, México e Colômbia; os próprios issues chegam em português e espanhol. A documentação pública do SDK já é multilíngue; a extensão destoa.

### 5.3 Instrumentação global em todas as páginas

O content script, a flag, o monitor de performance e o header `X-Nube-Devtools` rodam em **todas** as páginas `http(s)` enquanto a extensão estiver instalada, não só em lojas (`src/manifest.ts`, `service-worker.ts`, `devtools-header.ts`). Consequências:
- a issue #490 (TITANPush) mostrou um patch de `sessionStorage.getItem` quebrando um script legado em loja sem SDK; o patch foi corrigido, mas a superfície continua global (`Storage.prototype` é patchado quando o painel abre e o `push` de `__NUBE_SDK_APPS__` em toda página);
- o header customizado em toda navegação é um vetor de fingerprint e vaza o uso da ferramenta para qualquer site;
- um parceiro que esquece a extensão ligada carrega instrumentação em todo o seu uso do navegador.

### 5.4 Local Mode: atrito na rotina diária

É o painel mais usado por quem desenvolve e tem os maiores ganhos pendentes (`components/local-mode-content.tsx`):
- `reloadCurrentTab` recarrega a **aba ativa**, não a inspecionada. Com o DevTools destacado em janela própria e outra aba em foco, recarrega a aba errada. O restante do painel usa `inspectedWindow.tabId`.
- não há recarga automática quando o bundle local muda; o parceiro alterna entre editor, terminal e navegador a cada alteração;
- a conexão vive no `sessionStorage` da aba; abrir a loja em uma nova aba perde o Local Mode sem aviso;
- ao conectar, nada leva o parceiro ao que ele quer ver em seguida (logs e componentes do app recém-injetado);
- o popup duplica a UI do painel com um caminho de dados ligeiramente diferente (lê os apps direto da página em vez do stream);
- a issue #265 (dois `app:register`, o primeiro com `storeId: 0`) e a #373 (iframe) mostram que o parceiro em Local Mode não consegue distinguir "bug meu" de "artefato do modo local". Um indicador claro de "este estado veio do Local Mode" ajudaria.

### 5.5 Apps: status "online" não é confiável

`use-script-statuses.ts` faz `fetch(url, { method: "HEAD", mode: "no-cors" })`. Uma resposta opaca resolve mesmo com 404 ou 500; só falha por erro de rede. Na prática, quase todo script aparece "online", inclusive um que não existe. O indicador transmite segurança falsa justamente no painel de diagnóstico.

### 5.6 A DevTools observa, mas não provoca

Para testar um app de checkout, o parceiro precisa de um cliente logado, um carrinho com itens, um cupom aplicado, um frete selecionado. Hoje a única ação disponível é "Resend event" (menu de contexto em Events), que reenvia o `next` state inteiro como modifier (`resend-event.ts`), o que pode sobrescrever estado atual e não permite editar payload. Não existe:
- envio de evento arbitrário (`cart:add`, `coupon:add`, `custom:*`) com payload editável;
- override de trechos do estado (simular `device.type = "mobile"`, `customer` logado, `location.page.type`);
- edição de props de um componente renderizado;
- replay de uma chamada `nube.api` com params alterados;
- viewer/editor de **App Settings** (`nube.getAppSettings()`), hoje só testável com configurações reais do lojista.

### 5.7 Cobertura incompleta das APIs novas do SDK

O SDK ganhou neste ano Customization, Observer, Structured Data, Analytics, Navigation, Available Slots, iframes e formulários. A DevTools vê essas APIs apenas como linhas em API Calls e, quando recusadas, como logs. Faltam visões próprias:
- **Customization**: o que cada app alterou em quais elementos nativos, com botão de reset (o register já guarda snapshot em `customization/snapshot.ts`);
- **Observer**: watches ativos por app, estado atual (`present`, `visible`, posição);
- **Structured Data**: preview do JSON-LD resultante;
- **Analytics**: eventos enviados ao provedor do host, com `send_to`;
- **Iframe bridge**: mensagens em ambos os sentidos (a issue #373 gastou dias de um parceiro justamente por não haver visibilidade aqui);
- **Available Slots**: slots presentes na página e **não usados** pelo app. Components só mostra slots com conteúdo; descobrir onde o app poderia renderizar continua sendo tentativa e erro.

### 5.8 Logs: expectativa vs. captura

O tooltip diz corretamente que só `console.error` é capturado, mas é o que o parceiro menos espera: `console.log` é a ferramenta de depuração número um e some dentro do worker. O register tem `log`, `info`, `warn` e `debug` comentados em `overwrites.ts`; nada impede capturá-los quando `__NUBE_DEVTOOLS_EXTENSION__` está presente e descartá-los da telemetria remota. Além disso, stack traces de bundles minificados em `localhost` não passam por source maps, e logs repetidos não são agrupados.

### 5.9 Painéis individuais: ajustes pontuais

- **Events**: `page:scroll` e `device:updated` inundam a lista (cada record carrega dois estados completos). Falta agrupar/colapsar eventos de alta frequência e um diff lado a lado `prev`/`next`; o payload não é exibido como coluna.
- **State**: re-executa `getState()` a cada evento, inclusive scroll. Não tem busca por caminho, "copiar caminho" nem "fixar" caminhos observados.
- **Storage**: não permite criar uma chave nova nem simular expiração de TTL.
- **Performance**: não compara com uma execução anterior nem destaca regressões entre reloads.
- **SVG Converter**: conversão por regex (`<text` também casa `<textPath`, não trata `xlink:href`, remove `class` e `id` silenciosamente). É uma ferramenta de autoria no meio de painéis de depuração; faz mais sentido no site de docs ou no `create-nube-app`.
- **Sidebar**: dez itens sem agrupamento; State fica por último e SVG Converter no meio dos painéis de runtime. Não há atalhos de teclado nem paleta de comandos.
- **Filtros persistidos globalmente**: o filtro de busca salvo em `localStorage` vale para todas as lojas; abrir outra loja mostra uma lista vazia por causa de um filtro antigo (há aviso "N hidden", mas o padrão surpreende).

### 5.10 Suporte e feedback

- Não existe forma de exportar uma **sessão completa** (apps, versão do SDK, eventos, logs, API calls, performance) para anexar a um issue. Cada painel exporta separado, ou nem exporta (Events, State, Apps).
- A versão do register/runtime carregado na página não aparece em lugar nenhum da UI, embora seja a primeira pergunta do suporte.
- A extensão não tem canal de feedback nem telemetria de uso própria (quais painéis são usados, com que frequência o Unavailable aparece), então a priorização depende de issues espontâneas.

### 5.11 Documentação, release e qualidade

- `docs/` não existia até este relatório; o README é voltado a quem desenvolve a extensão, não a quem a usa. Não há página de uso em `nuvemshop.dev`.
- `CHANGELOG.md` parou em 0.0.0 (a extensão está em 1.14.1). Não há "o que há de novo" dentro da extensão; mudanças grandes (Components, Logs, Performance) passaram sem anúncio in-app.
- Apenas um arquivo de teste (`component-tree.spec.ts`). Lógica sensível como `storage-value.ts`, `json-diff.ts`, `performance-budget.ts`, `parseQuery` de Events e `formatters.ts` não tem cobertura.
- Templates do `create-nube-app` não mencionam a DevTools; é o momento ideal de apresentá-la.

---

## 6. Features sugeridas

Legenda de impacto: **Alto** resolve dor recorrente dos parceiros ou destrava um fluxo inteiro; **Médio** melhora substancialmente um fluxo existente; **Baixo** é polimento. Esforço estimado em semanas de uma pessoa.

### 6.1 Onboarding e diagnóstico

| # | Feature | Impacto | Esforço |
|---|---|---|---|
| 1 | **Diagnóstico guiado no lugar do "Unavailable"**: checklist ao vivo (é uma loja Nuvemshop/Tiendanube? o register foi carregado? há apps em `state.apps`? o header forçou o SDK?), com re-checagem periódica e ações: recarregar, copiar relatório, abrir issue com template preenchido. | Alto | 1 |
| 2 | **Localização pt-BR / es / en**, seguindo o idioma do Chrome, com opção manual. | Alto | 1,5 |
| 3 | **Versão do SDK e da extensão visíveis** no header do painel, com aviso quando a extensão está desatualizada em relação à Web Store. | Médio | 0,5 |
| 4 | **"What's new"** na primeira abertura após update, gerado a partir do CHANGELOG. | Baixo | 0,5 |

### 6.2 Local Mode e ciclo de desenvolvimento

| # | Feature | Impacto | Esforço |
|---|---|---|---|
| 5 | **Auto-reload ao detectar alteração no bundle** (polling de `ETag`/`Last-Modified` ou websocket opcional exposto pelo template do `create-nube-app`). | Alto | 1 |
| 6 | **Recarregar a aba inspecionada**, não a ativa (`reloadCurrentTab`). Correção pontual. | Alto | 0,1 |
| 7 | **Perfis de Local Mode** (URL + app id + nome) persistidos por origem, com troca rápida; suporte a mais de um app local simultâneo. | Médio | 1 |
| 8 | **Atalhos pós-conexão**: "ver logs deste app", "ver componentes deste app", e filtro automático dos painéis pelo app local. | Médio | 0,5 |
| 9 | **Badge "Local Mode" nos eventos e logs** gerados pelo app injetado, para separar artefato do modo local de bug do app (issue #265). | Médio | 0,5 |
| 10 | **Integração com `create-nube-app`**: o template imprime a URL do bundle e um lembrete da DevTools; opcionalmente, um comando `npm run dev` que já abre a loja com a extensão conectada. | Médio | 1 |

### 6.3 Provocar cenários (de observadora a participante)

| # | Feature | Impacto | Esforço |
|---|---|---|---|
| 11 | **Event Composer**: enviar qualquer evento (`SENDABLE_EVENT` ou `custom:*`) com payload editado em JSON, com autocomplete a partir dos tipos públicos. Substitui o "Resend event" atual por um replay editável. | Alto | 1,5 |
| 12 | **State overrides / mocks**: fixar trechos do estado (cliente logado, device mobile, carrinho com N itens, cupom aplicado) via modifier persistente, com indicador visual de "estado alterado pela DevTools". | Alto | 2 |
| 13 | **App Settings editor**: ver e sobrescrever `getAppSettings()` localmente para testar variações sem mexer no admin do lojista. | Alto | 1 |
| 14 | **Editar props ao vivo em Components** (texto, cores, visibilidade), refletido no slot via `ui:slot:set` sintético. | Médio | 1,5 |
| 15 | **Replay de chamada `nube.api`** com params editados, e "copiar como código TypeScript". | Médio | 0,5 |
| 16 | **Simulação de device** (`device:updated`) e de página (`location`) sem recarregar. | Baixo | 1 |

### 6.4 Cobertura das APIs do host

| # | Feature | Impacto | Esforço |
|---|---|---|---|
| 17 | **Iframe Bridge**: log bidirecional de `postMessageToIframe` / `onMessage` por iframe, com origem, payload e motivo de descarte (issue #373). | Alto | 1 |
| 18 | **Available Slots**: lista de slots estáticos e dinâmicos presentes na página, destacando os vazios, com overlay no hover e "copiar nome". | Alto | 1 |
| 19 | **Customization inspector**: por app, quais targets foram alterados e com quais opções; botão de reset individual; contraste calculado quando recusado. | Médio | 1,5 |
| 20 | **Observer inspector**: watches ativos por app com estado atual e histórico de transições. | Médio | 1 |
| 21 | **Structured Data preview**: JSON-LD final renderizado pelo host, com validação básica. | Médio | 0,5 |
| 22 | **Analytics**: eventos enviados ao provedor do host, com `send_to` e payload. | Médio | 0,5 |

### 6.5 Logs, eventos e estado

| # | Feature | Impacto | Esforço |
|---|---|---|---|
| 23 | **Capturar `console.log/info/warn/debug` quando a extensão está presente** (flag no register), sem enviar à telemetria remota. | Alto | 0,5 (register) |
| 24 | **Source maps** para stacks de bundles em `localhost`, e link "abrir no Sources". | Médio | 1 |
| 25 | **Agrupar eventos de alta frequência** (`page:scroll`, `device:updated`) em uma linha colapsável, e diff lado a lado `prev`/`next` com opção "só o que mudou". | Médio | 1 |
| 26 | **Busca por caminho, pin de caminhos e "copiar caminho"** em State; mostrar payload como coluna em Events. | Médio | 0,5 |
| 27 | **Criar chave nova e expirar TTL manualmente** em Storage. | Baixo | 0,5 |
| 28 | **Baseline em Performance**: salvar uma execução e comparar o próximo reload, destacando regressões. | Baixo | 1 |

### 6.6 Suporte, qualidade e distribuição

| # | Feature | Impacto | Esforço |
|---|---|---|---|
| 29 | **Exportar sessão de depuração** (um JSON com versão do SDK, apps, eventos, logs, API calls, performance, storage anonimizado) e template de issue do GitHub que pede esse arquivo. | Alto | 1 |
| 30 | **Escopo da instrumentação sob demanda**: ativar flag, monitor e header só em origens reconhecidas como loja ou após o parceiro abrir o painel na aba; remover patches ao fechar. | Alto | 1 |
| 31 | **Health check do app**: checklist automático (tempo de init, erros, slots não montados, chamadas com erro, bundle size) com nota e dicas, útil antes de submeter à revisão. | Médio | 1,5 |
| 32 | **Documentação de uso em `nuvemshop.dev`** e `docs/` do pacote; CHANGELOG mantido por release. | Médio | 0,5 por release |
| 33 | **Testes** para `storage-value`, `json-diff`, `performance-budget`, `parseQuery`, `formatters`. | Médio | 1 |
| 34 | **Telemetria de uso da extensão** (opt-in) e botão de feedback. | Médio | 0,5 |
| 35 | **Paleta de comandos e atalhos** (trocar painel, limpar lista, focar busca). | Baixo | 0,5 |
| 36 | **Suporte a Firefox/Edge** (Manifest V3 já é compatível na maior parte). | Baixo | 1 |

---

## 7. Roadmap sugerido

**Curto prazo (próximas 4 semanas): remover atrito da primeira hora**
1. Diagnóstico guiado no lugar do Unavailable (#1) e versão do SDK visível (#3).
2. Correções pontuais: recarregar a aba inspecionada (#6), status real do script em Apps (checar `response.ok` com `cors` e tratar opaco como "desconhecido").
3. Capturar `console.log` e afins com a extensão presente (#23).
4. Exportar sessão de depuração e template de issue (#29).
5. Retomar o CHANGELOG e publicar a documentação de uso (#32).

**Médio prazo (1 a 3 meses): tornar o Local Mode o lugar onde o dia acontece**
1. Localização pt-BR/es (#2).
2. Auto-reload do bundle e perfis de Local Mode (#5, #7, #8, #9).
3. Event Composer e App Settings editor (#11, #13).
4. Iframe Bridge e Available Slots (#17, #18).
5. Escopo da instrumentação sob demanda (#30).

**Longo prazo (3 a 6 meses): DevTools como ambiente de teste**
1. State overrides / mocks e edição de props (#12, #14).
2. Inspectors de Customization, Observer, Structured Data e Analytics (#19 a #22).
3. Health check pré-submissão (#31).
4. Baseline de performance, agrupamento de eventos, source maps (#28, #25, #24).
5. Integração com `create-nube-app` e suporte a outros navegadores (#10, #36).

---

## 8. Apêndice: referência técnica rápida

### Chaves de storage usadas pela extensão

| Onde | Chave | Conteúdo |
|---|---|---|
| `sessionStorage` da página | `nube-devtools-application-server` | `{ script, connected, appId, type }` do Local Mode |
| `sessionStorage` da página | `nube-devtools-blocked-apps` | Array de apps bloqueados |
| `localStorage` do painel | `currentPage`, `nube-devtools-*-filter-search`, `nube-devtools-*-page-width`, `nube-devtools-panel-direction`, `nube-devtools-events-column-widths`, `nube-devtools-performance-banner-dismissed`, `nube-devtools-app-server-url`, `nube-devtools-local-mode-selected-tab` | Preferências de UI |

### Globais no `window` da página

| Global | Quem escreve | Para quê |
|---|---|---|
| `__NUBE_DEVTOOLS_EXTENSION__` | `inject-extension-flag.js` | Runtime cria o hook; register aplica overrides |
| `__NUBE_SDK_DEVTOOLS_HOOK__` | Runtime ou `handleEvents` | Canal de eventos e logs |
| `__NUBE_SDK_APPS__` | Register (`attach.ts`) | Lista `{ id, worker }`; monitor de performance intercepta o `push` |
| `__NUBE_DEVTOOLS_COMMANDS__` | `handleCommands` | Histórico de `nube.api` |
| `__NUBE_DEVTOOLS_PERFORMANCE__` | `inject-performance-monitor.js` | Histórico de medições |
| `__NUBE_DEVTOOLS_EVENTS_CLEARED_SEQ__`, `__NUBE_DEVTOOLS_LOGS_CLEARED_SEQ__` | Painel | Marca de "limpar lista" |

### Canais `CustomEvent` e ports

| CustomEvent (página) | Port (`chrome.runtime`) | Padrão |
|---|---|---|
| `NubeSDKEvents` | `nube-devtools-events` | Port longo aberto pelo painel |
| `NubeSDKLogEvents` | `nube-devtools-log-events` | Um port por lote |
| `NubeSDKStorageEvents` | `nube-devtools-storage-events` | Um port por lote |
| `NubeSDKCommandEvents` | `nube-devtools-command-events` | Um port por lote |
| `NubeSDKPerformanceEvents` | `nube-devtools-performance-events` | Um port por lote |

### Issues de parceiros relacionadas

| Issue | Tema | O que a DevTools poderia ter evitado |
|---|---|---|
| #231, #306 (+ comentários tardios) | "Unavailable" em loja válida | Diagnóstico guiado (#1) |
| #490 | Patch global de `sessionStorage.getItem` quebrou script legado | Escopo sob demanda (#30) |
| #265 | `storeId: 0` em Local Mode, dois `app:register` | Badge de origem Local Mode (#9) |
| #373 | Iframe messaging sem visibilidade | Iframe Bridge (#17) |
