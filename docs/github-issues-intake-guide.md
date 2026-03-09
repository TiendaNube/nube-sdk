# NubeSDK GitHub Issues Intake Guide

Guia interno de como o intake de bugs, feature requests e perguntas funciona no repositorio [nube-sdk](https://github.com/TiendaNube/nube-sdk) e como os itens aparecem no Linear.

---

## Visao geral do fluxo

```
Partner abre no GitHub ──> Labels aplicados automaticamente ──> Linear (Triage)
                                                                  │
                                                                  ├─ Bug: label Bug + prioridade sincronizada
                                                                  └─ Request: label Partner Request + tipo (Slot/Component/Event/Other)
```

| Tipo | Onde abre | Labels no GitHub | Labels no Linear | Prioridade no Linear |
|------|-----------|------------------|------------------|----------------------|
| Bug | GitHub Issues | `bug` | `Bug` | Sincronizada via severity dropdown |
| Feature Request | GitHub Issues | `Partner Request` + tipo (`Slot`, `Component`, `Event` ou `Other`) | `Partner Request` + tipo | Definida pelo time |
| Pergunta | GitHub Discussions | N/A | N/A | N/A |

---

## 1. Bug Report

### O que o partner ve

**URL:** https://github.com/TiendaNube/nube-sdk/issues/new?template=bug-report.yml

O formulario tem 4 campos:

| Campo | Tipo | Obrigatorio |
|-------|------|-------------|
| App ID | Input texto | Sim |
| App name | Input texto | Nao |
| Severity | Dropdown | Nao |
| Bug Description | Textarea com template | Sim |

**Severity** (opcional), com opcoes explicativas para o partner:

| Opcao no formulario | Prioridade no Linear |
|---------------------|----------------------|
| Urgent - My app and stores are impacted right now | Urgent (1) |
| High - Core functionality is broken but there is a workaround | High (2) |
| Medium - Something is not working as expected but does not block usage | Medium (3) |
| Low - Minor issue or visual glitch | Low (4) |

**Bug Description** vem pre-preenchido com um template editavel:
- What happened?
- Steps to reproduce
- Expected behavior
- Environment (opcional)
- Logs or screenshots (opcional)

O titulo e pre-preenchido com `[BUG] `.

### O que acontece automaticamente

1. A issue e criada no GitHub com o label `bug`
2. A integracao Linear cria um item no bucket de **Triage** com o label `Bug`
3. A GitHub Action `sync-severity-to-linear` detecta a severidade selecionada, busca o item no Linear por titulo, e **seta a prioridade automaticamente** (Urgent/High/Medium/Low)
4. Se for a primeira issue do usuario, ele recebe uma mensagem de boas-vindas

### O que o time interno faz

1. O item aparece no Triage do Linear ja com a prioridade definida pelo partner (se selecionada)
2. O time revisa, ajusta a prioridade se necessario, e atribui para o responsavel
3. Quando o time fecha a issue no Linear, ela e fechada no GitHub (e vice-versa)

### Diagrama do fluxo de bug

```
Partner abre bug no GitHub
        │
        ├─ Label `bug` aplicado (template)
        │
        ├─ Integracao Linear cria item no Triage com label `Bug`
        │
        ├─ Action: sync-severity-to-linear
        │     │
        │     ├─ Le severity do body da issue
        │     ├─ Busca item no Linear por titulo (ate 6 tentativas, 15s intervalo)
        │     └─ Seta prioridade via API GraphQL do Linear
        │
        └─ Action: welcome (se primeiro issue do usuario)
```

---

## 2. Feature Request

### O que o partner ve

**URL:** https://github.com/TiendaNube/nube-sdk/issues/new?template=feature-request.yml

O formulario tem 4 campos:

| Campo | Tipo | Obrigatorio |
|-------|------|-------------|
| App ID | Input texto | Nao |
| App name | Input texto | Nao |
| Request Type | Dropdown | Sim |
| Feature Description | Textarea com template | Sim |

**Request Type** (obrigatorio):

| Opcao | Label aplicado | Label no Linear |
|-------|---------------|-----------------|
| Slot | `Slot` | `Slot` |
| Component | `Component` | `Component` |
| Event | `Event` | `Event` |
| Other | `Other` | `Other` |

**Feature Description** vem pre-preenchido com um template editavel:
- What problem does this solve?
- Proposed solution
- Use case (opcional)
- Alternatives considered (opcional)

O titulo e pre-preenchido com `[REQUEST] `.

### O que acontece automaticamente

1. A issue e criada no GitHub com o label `Partner Request`
2. A GitHub Action `auto-label-request-type` le o dropdown e aplica o label de tipo (`Slot`, `Component`, `Event` ou `Other`)
3. A integracao Linear cria um item no Triage com os labels `Partner Request` + tipo
4. Se for a primeira issue do usuario, ele recebe uma mensagem de boas-vindas

### O que o time interno faz

1. O item aparece no Triage do Linear com labels `Partner Request` e o tipo
2. O time avalia a viabilidade, prioriza e planeja
3. Quando resolvido ou recusado, o time fecha a issue no Linear (reflete no GitHub)

### Diagrama do fluxo de feature request

```
Partner abre request no GitHub
        │
        ├─ Label `Partner Request` aplicado (template)
        │
        ├─ Action: auto-label-request-type
        │     │
        │     └─ Le Request Type do body e aplica label: Slot, Component, Event ou Other
        │
        ├─ Integracao Linear cria item no Triage com labels Partner Request + tipo
        │
        └─ Action: welcome (se primeiro issue do usuario)
```

---

## 3. Perguntas (Q&A)

### O que o partner ve

Quando o partner clica em "New issue" no repositorio, ele ve tres opcoes:
- Bug Report
- Feature Request
- **Questions & Help** (redireciona para Discussions Q&A)

Issues em branco estao desabilitadas. Perguntas nao sao issues, sao discussions.

**URL direta:** https://github.com/TiendaNube/nube-sdk/discussions/categories/q-a

### O que acontece

- A pergunta fica na aba Discussions do GitHub
- **Nao cria nada no Linear** (discussions nao sao sincronizadas)
- A comunidade e o time podem responder
- O autor pode marcar uma resposta como "accepted answer"

---

## 4. Announcements

A categoria Announcements nas Discussions e usada para comunicar releases e novidades.

**URL:** https://github.com/TiendaNube/nube-sdk/discussions/categories/announcements

Apenas membros do time com permissao podem criar posts nessa categoria.

---

## Como o partner escolhe o que abrir

Quando o partner acessa https://github.com/TiendaNube/nube-sdk/issues/new/choose, ele ve:

| Opcao | Descricao | Destino |
|-------|-----------|---------|
| Bug Report | Report a bug in NubeSDK | Formulario de bug |
| Feature Request | Suggest a new feature or improvement for NubeSDK | Formulario de request |
| Questions & Help | Ask questions and get help from the community | GitHub Discussions Q&A |
| NubeSDK Documentation | Check the official docs before opening an issue | Docs oficiais |

---

## Labels no GitHub

### Labels automaticos (aplicados por templates e actions)

| Label | Quando e aplicado | Sincroniza com Linear |
|-------|-------------------|----------------------|
| `bug` | Bug report (template) | Sim, mapeia para `Bug` |
| `Partner Request` | Feature request (template) | Sim, mapeia para `Partner Request` |
| `Slot` | Feature request tipo Slot (action) | Sim, mapeia para `Slot` |
| `Component` | Feature request tipo Component (action) | Sim, mapeia para `Component` |
| `Event` | Feature request tipo Event (action) | Sim, mapeia para `Event` |
| `Other` | Feature request tipo Other (action) | Sim, mapeia para `Other` |

### Labels manuais (uso interno do time)

| Label | Uso |
|-------|-----|
| `documentation` | Melhorias em docs |
| `duplicate` | Issue duplicada |
| `help wanted` | Precisa de atencao extra |
| `invalid` | Issue invalida |
| `question` | Pedido de informacao |
| `wontdo` | Nao sera implementado |

**Importante:** A sincronizacao de labels entre GitHub e Linear e **case-sensitive**. O nome do label precisa ser exatamente igual nos dois sistemas.

---

## Automacoes ativas (GitHub Actions)

| Action | Arquivo | Trigger | O que faz |
|--------|---------|---------|-----------|
| Sync Severity to Linear | `sync-severity-to-linear.yml` | Issue aberta com label `bug` | Le a severidade, busca o item no Linear por titulo, seta a prioridade via API |
| Auto Label Request Type | `auto-label-request-type.yml` | Issue aberta com label `Partner Request` | Le o Request Type do body e aplica o label correspondente |
| Welcome | `welcome.yml` | Primeira issue de um usuario | Posta mensagem de boas-vindas com links uteis |
| Stale Issues | `stale-issues.yml` | Toda segunda-feira 9h UTC | Marca issues inativas (60 dias) como stale, fecha apos 14 dias |

### Secrets necessarios

A action `sync-severity-to-linear` depende de dois secrets no repositorio:

| Secret | Descricao | Onde obter |
|--------|-----------|------------|
| `LINEAR_API_KEY` | API key do Linear com permissao de escrita | Linear > Settings > API > Personal API Keys |
| `LINEAR_TEAM_ID` | UUID do time no Linear (time EXT) | Via API do Linear (query `teams`) |

Esses secrets estao configurados em: https://github.com/TiendaNube/nube-sdk/settings/secrets/actions

---

## Mapeamento completo GitHub <-> Linear

| Acao no GitHub | Reflexo no Linear |
|----------------|-------------------|
| Partner abre bug com label `bug` | Item criado no Triage com label `Bug` |
| Partner seleciona severity no bug | Prioridade setada automaticamente (via Action + API) |
| Partner abre request com label `Partner Request` | Item criado no Triage com label `Partner Request` |
| Partner seleciona Request Type (ex: Slot) | Label `Slot` aplicado no GitHub e sincronizado com Linear |
| Partner fecha issue | Item fechado no Linear |
| Partner comenta na issue | Comentario aparece no Linear |
| Time fecha item no Linear | Issue fechada no GitHub |
| Time comenta no Linear | Comentario aparece no GitHub |
| Time muda labels no Linear | Labels sincronizados no GitHub |
| Partner abre Discussion | **Nao reflete no Linear** |

---

## Agrupamento por parceiro

O campo **App ID** nos formularios permite agrupar issues por parceiro. Para bugs o App ID e obrigatorio, para requests e opcional.

No futuro, isso pode ser integrado com a feature **Customers** do Linear para ter uma visao consolidada de todos os bugs e requests de cada parceiro, vinculando por App ID.

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
| Secrets config | https://github.com/TiendaNube/nube-sdk/settings/secrets/actions |
