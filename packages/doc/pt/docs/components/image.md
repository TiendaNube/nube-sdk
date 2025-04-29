---
title: Image Component
---

# Image

O componente `Image` permite exibir imagens em sua aplicação. Ele suporta diferentes formatos de imagem e fornece opções para controlar o tamanho e o estilo.

## Uso

::: code-group

```tsx [JSX]
import { Image } from "@tiendanube/nube-sdk-jsx";

function Logo() {
  return <Image src="https://hostname/image.webp" alt="Logo" />;
}
```

```typescript [Declarative]
import { image } from "@tiendanube/nube-sdk-ui";

function logo() {
  return image({ src: "https://hostname/image.webp", alt: "Logo" });
}
```

:::

Optionally, the Img component can receive alternative sources loaded by media query.

::: code-group

```tsx [JSX]
import { Image } from "@tiendanube/nube-sdk-jsx";

function Logo() {
  return (
    <Image
      src="https://hostname/default.png"
      alt="Hello"
      sources={[
        {
          src: "https://hostname/desktop.png",
          media: "(min-width: 769px)",
        },
        {
          src: "https://hostname/mobile.png",
          media: "(max-width: 768px)",
        },
      ]}
    />
  );
}
```

```typescript [Declarative]
import { image } from "@tiendanube/nube-sdk-ui";

function logo() {
  return image({
    src: "https://hostname/default.png",
    alt: "Hello",
    sources: [
      {
        src: "https://hostname/desktop.png",
        media: "(min-width: 769px)",
      },
      {
        src: "https://hostname/mobile.png",
        media: "(max-width: 768px)",
      },
    ],
  });
}
```

:::

## Propriedades

| Propriedade | Tipo          | Obrigatório | Descrição                                                       |
| ----------- | ------------- | ----------- | --------------------------------------------------------------- |
| src         | string        | Sim         | URL of the image to display. Must use "https://".               |
| alt         | string        | Sim         | Alternative text for the image, used for accessibility.         |
| sources     | ImageSource[] | Não         | Array of alternative image sources with optional media queries. |
| width       | Size          | Não         | Width of the image (e.g., "100px", "50%", "auto", 100).         |
| height      | Size          | Não         | Height of the image (same format as width).                     |
| id          | string        | Não         | Optional unique identifier for the component.                   |

### ImageSource

| Propriedade | Tipo   | Obrigatório | Descrição                                      |
| ----------- | ------ | ----------- | ---------------------------------------------- |
| src         | string | Sim         | The alternative image source URL (https only). |
| media       | string | Não         | Optional media query to match this source.     |

### Valores das propriedades

| Tipo     | Valor                                        | Descrição                                                                                       |
| -------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Size     | `${number}${SizeUnit}`<br/>number<br/>"auto" | Represents a flexible size definition.<br/>It can be a number, a string with a unit, or "auto". |
| SizeUnit | "em"<br/>"rem"<br/>"px"<br/>"%"              | Defines units for size measurements.                                                            |

