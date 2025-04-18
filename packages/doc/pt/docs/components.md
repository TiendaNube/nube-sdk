---
title: Componentes
cards:
  - title: Box
    link: /pt/docs/components/box
    description: Um container flexível que pode ser usado para fins de layout. Suporta propriedades como largura, altura, padding, margin e alinhamento baseado em flex.
  - title: Button
    link: /pt/docs/components/button
    description: Um elemento clicável tipicamente usado para acionar uma ação ou enviar um formulário. Suporta propriedades como `text`, `onClick` e configurações de estilo.
  - title: Checkbox
    link: /pt/docs/components/checkbox
    description: Um campo selecionável que pode alternar entre estados marcado e desmarcado. É tipicamente usado para permitir que os usuários selecionem uma ou mais opções.
  - title: Column
    link: /pt/docs/components/column
    description: Uma `coluna` é um container flexível que pode ser usado para estruturar layouts. Herda a maioria das propriedades do `box`, exceto pela propriedade `direction`.
  - title: Field
    link: /pt/docs/components/field
    description: Um elemento de entrada em um formulário, como campos de texto, dropdowns ou checkboxes. Suporta propriedades como `name`, `label` e manipuladores de eventos (`onChange`, `onBlur`, `onFocus`).
  - title: Fragment
    link: /pt/docs/components/fragment
    description: Um elemento de agrupamento lógico que permite que múltiplos filhos sejam agrupados sem introduzir um componente adicional.
  - title: Image
    link: /pt/docs/components/image
    description: Usado para exibir imagens. Suporta propriedades como `src`, `alt`, `width`, `height` e `sources` responsivos para diferentes tamanhos de tela.
  - title: Row
    link: /pt/docs/components/row
    description: Um container flexível usado para estruturar layouts na direção horizontal. Herda a maioria das propriedades do `box`, exceto pela propriedade `direction`.
  - title: Text
    link: /pt/docs/components/text
    description: Usado para renderizar texto com estilização opcional. Suporta propriedades como `color`, `background`, níveis de `heading` (h1-h6), `modifiers` de formatação de texto (negrito, itálico, etc.) e exibição inline.
  - title: Textarea
    link: /pt/docs/components/textarea
    description: Um campo de entrada de texto multilinha que permite que os usuários insiram textos mais longos. Suporta propriedades como `name`, `value` e manipuladores de eventos (`onChange`, `onBlur`, `onFocus`).
---

# Componentes

As interfaces de usuário dos aplicativos criados com `NubeSDK` são feitas de componentes que se adaptam automaticamente ao tema da loja, mantendo a consistência do design. Podem ser desenvolvidas com JSX ou funções declarativas.

Nesta seção você encontrará todos os componentes disponíveis em nossa biblioteca.

<CardGrid :items="$frontmatter.cards" />
