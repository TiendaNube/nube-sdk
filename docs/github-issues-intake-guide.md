# NubeSDK Intake Guide

## Por que estamos mudando

Hoje os pedidos relacionados ao NubeSDK chegam por caminhos diferentes: spreadsheets, Google Docs, Slack, email, conversas avulsas. Isso gera problemas:

- Pedidos se perdem entre canais
- Nao existe visibilidade do que foi pedido, por quem e quando
- Nao da para priorizar sem ter tudo em um lugar so
- O time de Extensibility nao consegue medir demanda nem dar visibilidade de status

**A mudanca:** centralizar todos os pedidos relacionados ao NubeSDK (bugs, feature requests, melhorias) em um unico lugar, o **GitHub Issues** do repositorio [nube-sdk](https://github.com/TiendaNube/nube-sdk), com gestao e priorizacao no **Linear**.

---

## Quem pode abrir tickets

Este processo serve para **qualquer pessoa** que tenha um pedido ou reporte relacionado ao NubeSDK:

| Quem | Exemplos |
|------|----------|
| **Partners e desenvolvedores externos** | Desenvolvedores de apps que usam o NubeSDK |
| **Times internos da Nuvemshop** | Product, Engineering, Support, Sales, CS |
| **Time de Extensibility** | Para registrar bugs encontrados internamente |

A regra e simples: se o pedido e relacionado ao NubeSDK, abre no GitHub Issues. Nao importa se veio de um partner, de um colega de outro time, ou se voce mesmo encontrou o problema.

---

## Visao geral do fluxo

```
Qualquer pessoa abre no GitHub ──> Labels aplicados automaticamente ──> Linear (Triage)
                                                                          │
                                                                          ├─ Bug: label Bug + prioridade sincronizada
                                                                          └─ Request: label Partner Request + tipo
```

| Tipo | Onde abre | Labels no GitHub | Labels no Linear | Prioridade no Linear |
|------|-----------|------------------|------------------|----------------------|
| Bug | GitHub Issues | `bug` | `Bug` | Sincronizada via severity dropdown |
| Feature Request | GitHub Issues | `Partner Request` + tipo (`Slot`, `Component`, `Event` ou `Other`) | `Partner Request` + tipo | Definida pelo time |
| Pergunta | GitHub Discussions | N/A | N/A | N/A |

---

## 1. Bug Report

### Quando usar

- Algo no NubeSDK nao funciona como esperado
- Um comportamento mudou e quebrou algo
- Erros, crashes, comportamento inesperado

### Como abrir

**URL:** https://github.com/TiendaNube/nube-sdk/issues/new?template=bug-report.yml

O formulario tem 4 campos:

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| App ID | Input texto | Sim | Identificador numerico do app afetado |
| App name | Input texto | Nao | Nome do app para contexto |
| Severity | Dropdown | Nao | Gravidade do bug (define prioridade no Linear) |
| Bug Description | Textarea com template | Sim | Descricao detalhada do problema |

**Severity** (opcional), com opcoes claras:

| Opcao no formulario | Prioridade no Linear | Quando usar |
|---------------------|----------------------|-------------|
| Urgent - My app and stores are impacted right now | Urgent | O app ou lojas estao fora do ar ou com funcionalidade critica quebrada |
| High - Core functionality is broken but there is a workaround | High | Funcionalidade importante quebrada, mas existe alternativa temporaria |
| Medium - Something is not working as expected but does not block usage | Medium | Algo nao funciona direito, mas nao impede o uso |
| Low - Minor issue or visual glitch | Low | Problema visual, cosmetic, ou de baixo impacto |

O titulo e pre-preenchido com `[BUG] ` e o campo de descricao vem com um template editavel guiando o que preencher.

### O que acontece depois de abrir

1. A issue e criada no GitHub com o label `bug`
2. A integracao Linear cria um item no bucket de **Triage** com o label `Bug`
3. Se uma severity foi selecionada, a prioridade e **setada automaticamente no Linear**
4. Se for a primeira issue do usuario, ele recebe uma mensagem de boas-vindas

### O que o time de Extensibility faz

1. O item aparece no Triage do Linear ja com a prioridade sugerida (se selecionada)
2. O time revisa, ajusta a prioridade se necessario, e atribui para o responsavel
3. Quando o time resolve e fecha a issue no Linear, ela e fechada no GitHub automaticamente

---

## 2. Feature Request

### Quando usar

- Precisa de um novo slot, componente ou evento no NubeSDK
- Quer uma melhoria em algo que ja existe
- Tem uma necessidade que o SDK nao atende hoje

### Como abrir

**URL:** https://github.com/TiendaNube/nube-sdk/issues/new?template=feature-request.yml

O formulario tem 4 campos:

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| App ID | Input texto | Nao | ID do app (pode nao ter ainda) |
| App name | Input texto | Nao | Nome do app para contexto |
| Request Type | Dropdown | Sim | Tipo do pedido |
| Feature Description | Textarea com template | Sim | Descricao do que precisa |

**Request Type** (obrigatorio):

| Opcao | Descricao | Label aplicado |
|-------|-----------|---------------|
| Slot | Novo slot ou modificacao de slot existente | `Slot` |
| Component | Novo componente ou melhoria em componente existente | `Component` |
| Event | Novo evento ou modificacao de evento existente | `Event` |
| Other | Qualquer outro tipo de pedido | `Other` |

O titulo e pre-preenchido com `[REQUEST] ` e o campo de descricao vem com um template editavel.

### O que acontece depois de abrir

1. A issue e criada no GitHub com o label `Partner Request`
2. O label de tipo (`Slot`, `Component`, `Event` ou `Other`) e aplicado automaticamente
3. A integracao Linear cria um item no Triage com os labels `Partner Request` + tipo
4. Se for a primeira issue do usuario, ele recebe uma mensagem de boas-vindas

### O que o time de Extensibility faz

1. O item aparece no Triage do Linear com labels `Partner Request` e o tipo
2. O time avalia viabilidade, prioriza e planeja
3. Quando resolvido ou recusado, fecha a issue no Linear (reflete no GitHub)

---

## 3. Q&A (Forum da comunidade)

### O que e

O Q&A funciona como um **forum da comunidade** do NubeSDK. E um espaco aberto onde qualquer pessoa pode criar discussoes, fazer perguntas, compartilhar experiencias e trocar conhecimento.

Diferente de bugs e feature requests (que sao issues e vao para o Linear), o Q&A e um espaco de conversa e colaboracao que vive apenas no GitHub.

### Quando usar

- Duvidas sobre como usar o NubeSDK
- Perguntas tecnicas sobre implementacao
- Nao sabe se e bug ou se esta usando errado
- Quer discutir uma abordagem ou compartilhar uma solucao
- Topicos de discussao abertos com a comunidade

### Como abrir

Qualquer usuario logado no GitHub pode criar uma nova discussao na categoria Q&A.

Quando alguem clica em "New issue" no repositorio, a opcao **Questions & Help** redireciona para o forum.

**URL direta:** https://github.com/TiendaNube/nube-sdk/discussions/categories/q-a

### Como funciona

- Qualquer pessoa pode abrir uma nova discussao
- Qualquer pessoa pode responder e participar
- O autor da pergunta pode marcar uma resposta como "accepted answer"
- Discussoes ficam organizadas e pesquisaveis na aba Discussions do GitHub
- **Nao cria nada no Linear** (discussions nao sao sincronizadas)

---

## 4. Announcements (Changelog do SDK)

### O que e

A categoria Announcements funciona como o **changelog publico** do NubeSDK. E onde o time de Extensibility comunica o que foi entregue: novos slots, componentes, eventos, melhorias, correcoes e qualquer mudanca relevante.

### Quando usar

- Publicar o que foi entregue em cada release ou ciclo
- Comunicar mudancas importantes (breaking changes, deprecations)
- Anunciar novas funcionalidades disponiveis para partners

### Como funciona

- **Apenas membros do time** com permissao podem criar posts
- Partners e a comunidade podem comentar e reagir aos posts
- Cada post funciona como uma entrada de changelog com detalhes sobre o que mudou
- Fica acessivel publicamente para qualquer pessoa acompanhar a evolucao do SDK

**URL:** https://github.com/TiendaNube/nube-sdk/discussions/categories/announcements

---

## Tela de escolha ao abrir issue

Quando alguem acessa https://github.com/TiendaNube/nube-sdk/issues/new/choose, ve:

| Opcao | Descricao | Destino |
|-------|-----------|---------|
| Bug Report | Report a bug in NubeSDK | Formulario de bug |
| Feature Request | Suggest a new feature or improvement for NubeSDK | Formulario de request |
| Questions & Help | Ask questions and get help from the community | GitHub Discussions Q&A |
| NubeSDK Documentation | Check the official docs before opening an issue | Docs oficiais |

Issues em branco estao desabilitadas. Todo pedido passa por um template.

---

## Labels

### Labels automaticos (aplicados por templates e actions)

| Label | Quando e aplicado | Sincroniza com Linear |
|-------|-------------------|----------------------|
| `bug` | Bug report (template) | Sim, mapeia para `Bug` |
| `Partner Request` | Feature request (template) | Sim, mapeia para `Partner Request` |
| `Slot` | Feature request tipo Slot (action) | Sim, mapeia para `Slot` |
| `Component` | Feature request tipo Component (action) | Sim, mapeia para `Component` |
| `Event` | Feature request tipo Event (action) | Sim, mapeia para `Event` |
| `Other` | Feature request tipo Other (action) | Sim, mapeia para `Other` |

**Importante:** A sincronizacao de labels entre GitHub e Linear e **case-sensitive**. O nome do label precisa ser exatamente igual nos dois sistemas. Se alguem renomear um label em qualquer um dos lados, a sincronizacao quebra.

---

## Automacoes (GitHub Actions)

| Action | Arquivo | Trigger | O que faz |
|--------|---------|---------|-----------|
| Sync Severity to Linear | `sync-severity-to-linear.yml` | Issue aberta com label `bug` | Le a severidade, busca o item no Linear por titulo, seta a prioridade via API |
| Auto Label Request Type | `auto-label-request-type.yml` | Issue aberta com label `Partner Request` | Le o Request Type do body e aplica o label correspondente |
| Welcome | `welcome.yml` | Primeira issue de um usuario | Posta mensagem de boas-vindas com links uteis |
| Stale Issues | `stale-issues.yml` | Toda segunda-feira 9h UTC | Marca issues inativas (60 dias) como stale, fecha apos 14 dias |

---

## Mapeamento completo GitHub <-> Linear

| Acao no GitHub | Reflexo no Linear |
|----------------|-------------------|
| Alguem abre bug com label `bug` | Item criado no Triage com label `Bug` |
| Severity selecionada no bug | Prioridade setada automaticamente (Urgent/High/Medium/Low) |
| Alguem abre request com label `Partner Request` | Item criado no Triage com label `Partner Request` |
| Request Type selecionado (ex: Slot) | Label `Slot` aplicado no GitHub e sincronizado com Linear |
| Alguem fecha issue no GitHub | Item fechado no Linear |
| Alguem comenta na issue | Comentario aparece no Linear |
| Time fecha item no Linear | Issue fechada no GitHub |
| Time comenta no Linear | Comentario aparece no GitHub |
| Time muda labels no Linear | Labels sincronizados no GitHub |
| Alguem abre Discussion | **Nao reflete no Linear** |

---

## Agrupamento por parceiro

O campo **App ID** nos formularios permite agrupar issues por parceiro. Para bugs o App ID e obrigatorio, para requests e opcional (pode nao ter app ainda).

No futuro, isso pode ser integrado com a feature **Customers** do Linear para ter uma visao consolidada de todos os bugs e requests de cada parceiro.

---

## O que muda na pratica

### Para times internos

**Antes:** mandava pedido por Slack, email, spreadsheet, doc.
**Agora:** abre issue no GitHub com o template. O pedido cai direto no Triage do Linear com labels e prioridade.

### Para partners e devs externos

**Antes:** nao tinha template, issue sem padrao, sem priorizacao clara.
**Agora:** formulario guiado, prioridade sincronizada, visibilidade de status (open/closed).

### Para o time de Extensibility

**Antes:** pedidos espalhados, sem rastreabilidade, sem metricas.
**Agora:** tudo no Linear, com labels para filtrar por tipo (bug/request), por categoria (Slot/Component/Event), por parceiro (App ID), e com prioridade ja definida.

---

## Links rapidos

| Recurso | URL |
|---------|-----|
| Issues | https://github.com/TiendaNube/nube-sdk/issues |
| Novo bug | https://github.com/TiendaNube/nube-sdk/issues/new?template=bug-report.yml |
| Novo request | https://github.com/TiendaNube/nube-sdk/issues/new?template=feature-request.yml |
| Discussions Q&A | https://github.com/TiendaNube/nube-sdk/discussions/categories/q-a |
| Announcements | https://github.com/TiendaNube/nube-sdk/discussions/categories/announcements |
| Contributing guide | https://github.com/TiendaNube/nube-sdk/blob/main/CONTRIBUTING.md |
| Changelog | https://github.com/TiendaNube/nube-sdk/blob/main/CHANGELOG.md |
| Actions (logs) | https://github.com/TiendaNube/nube-sdk/actions |
