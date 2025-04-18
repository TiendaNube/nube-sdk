---
title: Image Component
---

# Image

El componente `Image` permite mostrar imágenes en tu aplicación. Soporta diferentes formatos de imagen y ofrece opciones para controlar el tamaño y el estilo.

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

## Properties

| Property | Type          | Required | Description                                                     |
| -------- | ------------- | -------- | --------------------------------------------------------------- |
| src      | string        | Yes      | URL of the image to display. Must use "https://".               |
| alt      | string        | Yes      | Alternative text for the image, used for accessibility.         |
| sources  | ImageSource[] | No       | Array of alternative image sources with optional media queries. |
| width    | Size          | No       | Width of the image (e.g., "100px", "50%", "auto", 100).         |
| height   | Size          | No       | Height of the image (same format as width).                     |
| id       | string        | No       | Optional unique identifier for the component.                   |

### ImageSource

| Property | Type   | Required | Description                                    |
| -------- | ------ | -------- | ---------------------------------------------- |
| src      | string | Yes      | The alternative image source URL (https only). |
| media    | string | No       | Optional media query to match this source.     |

### Property values

| Type     | Value                                        | Description                                                                                            |
| -------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| SizeUnit | "em"<br/>"rem"<br/>"px"<br/>"%"              | Define las unidades para mediciones de tamaño.                                                         |
| Size     | `${number}${SizeUnit}`<br/>number<br/>"auto" | Representa una definición de tamaño flexible.<br/>Puede ser un número, una cadena con unidad o "auto". |
