---
title: Componentes
cards:
  - title: Box
    link: /es/docs/components/box
    description: Un contenedor flexible que puede ser utilizado para propósitos de layout. Soporta propiedades como ancho, alto, padding, margen y alineación basada en flex.
  - title: Button
    link: /es/docs/components/button
    description: Un elemento clicable típicamente usado para activar una acción o enviar un formulario. Soporta propiedades como `text`, `onClick` y configuraciones de estilo.
  - title: Checkbox
    link: /es/docs/components/checkbox
    description: Un campo seleccionable que puede alternar entre estados marcado y desmarcado. Es típicamente usado para permitir que los usuarios seleccionen una o más opciones.
  - title: Column
    link: /es/docs/components/column
    description: Una `column` es un contenedor vertical flexible que se puede utilizar para estructurar diseños. Hereda la mayoría de las propiedades del `box`, excepto por la propiedad `direction`.
  - title: Field
    link: /es/docs/components/field
    description: Un elemento de entrada en un formulario, como campos de texto, dropdowns o checkboxes. Soporta propiedades como `name`, `label` y manejadores de eventos (`onChange`, `onBlur`, `onFocus`).
  - title: Fragment
    link: /es/docs/components/fragment
    description: Un elemento de agrupamiento lógico que permite que múltiples hijos sean agrupados sin introducir un componente adicional.
  - title: Image
    link: /es/docs/components/image
    description: Usado para mostrar imágenes. Soporta propiedades como `src`, `alt`, `width`, `height` y `sources` responsivos para diferentes tamaños de pantalla.
  - title: Row
    link: /es/docs/components/row
    description: Un contenedor flexible usado para estructurar layouts en dirección horizontal. Hereda la mayoría de las propiedades del `box`, excepto por la propiedad `direction`.
  - title: Text
    link: /es/docs/components/text
    description: Usado para renderizar texto con estilización opcional. Soporta propiedades como `color`, `background`, niveles de `heading` (h1-h6), `modifiers` de formato de texto (negrita, itálica, etc.) y visualización inline.
  - title: Textarea
    link: /es/docs/components/textarea
    description: Un campo de entrada de texto multilínea que permite que los usuarios ingresen textos más largos. Soporta propiedades como `name`, `value` y manejadores de eventos (`onChange`, `onBlur`, `onFocus`).
---

# Componentes

Las interfaces de usuario de las aplicaciones creadas con `NubeSDK` están hechas de componentes que se adaptan automáticamente al tema de la tienda, manteniendo la consistencia del diseño. Pueden ser desarrolladas con JSX o funciones declarativas.

En esta sección encontrarás todos los componentes disponibles en nuestra biblioteca.

<CardGrid :items="$frontmatter.cards" />
