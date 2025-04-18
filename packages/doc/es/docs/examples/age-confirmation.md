# Confirmación de edad

En este ejemplo, crearemos una aplicación que agrega un [checkbox](/es/docs/components/checkbox) al checkout para que los usuarios confirmen que tienen más de 18 años.

## Configuración del proyecto

Asegúrate de tener [Node.js®](https://nodejs.org) versión 16 o superior instalada en tu computadora.

Comencemos creando la estructura inicial del proyecto con el CLI de NubeSDK. Ejecuta el siguiente comando:

```bash
npm create nube-app@latest
```
::: tip
Si es la primera vez que usas el CLI o si hay una nueva versión disponible, se te pedirá que confirmes la instalación. Solo presiona `y` para continuar.
:::

En las opciones que aparecen, define el nombre de la app como `age-confirmation` y elige la plantilla con `JSX`.

![CLI output](/images/examples/age-app-cli.png)

Recomendamos usar [VS Code](https://code.visualstudio.com/) como editor de código, así que vamos a usarlo para abrir el proyecto.

![install vscode extensions](/images/examples/age-app-vscode-1.png)

::: tip
Nuestras plantillas incluyen extensiones recomendadas para ayudar en el desarrollo.
:::

![vscode recommended extensions](/images/examples/vscode-recommended.png)

## Inicialización de la aplicación

Nuestra aplicación necesita informar a la tienda que es responsable de realizar una validación del checkout. Comencemos editando el archivo `src/main.tsx`, eliminando el contenido de la plantilla y agregando esta configuración inicial.

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

## Bloqueo del checkout

Para asegurarnos de que los usuarios solo puedan proceder con su compra después de confirmar su edad, marcaremos el carrito como "inválido" tan pronto como comience el checkout.

Primero, creemos una validación para asegurarnos de que el cliente esté en la página inicial del checkout. Crearé un archivo en `src/utils/page.ts` para esta función.

```tsx
import type { AppLocation } from "@tiendanube/nube-sdk-types";

export function isStartPage(location: AppLocation) {
  return location.page.type === "checkout" && location.page.data.step === "start";
}
```

Ahora podemos usar esta validación en el archivo `main.tsx` para requerir la confirmación en el carrito usando el evento [`cart:validate`](/es/docs/events#cart-validate).

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
            reason: "Producto solo disponible para mayores de 18 años", // [!code focus]
          }, // [!code focus]
        }, // [!code focus]
      })); // [!code focus]
    } // [!code focus]
  });
}
```

::: tip
El evento `checkout:ready` se dispara cada vez que el cliente cambia de página en el checkout, asegurando que la verificación se ejecutará incluso si el usuario navega entre los pasos del checkout.
:::

## Creación del componente de confirmación

Para permitir que los usuarios confirmen su edad, usaremos un [Checkbox](/es/docs/components/checkbox) que cambia el estado de validación del carrito cuando se selecciona.

En `src/components/`, crea un nuevo archivo `AgeConfirmation.tsx`.

```tsx
import { Checkbox } from "@tiendanube/nube-sdk-jsx";

export function AgeConfirmation() {
  return (
    <Checkbox
      id="age-confirmation"
      name="age-confirmation"
      label="Tengo más de 18 años"
      checked={false}
    />
  );
}
```

Ahora necesitamos hacer que el checkbox dispare un nuevo evento cuando se seleccione. La forma más simple de hacer esto es recibiendo una instancia de NubeSDK como propiedad del componente.

```tsx
import { Checkbox } from "@tiendanube/nube-sdk-jsx";
import type { NubeSDK } from "@tiendanube/nube-sdk-types"; // [!code focus]

export type AgeConfirmationProps = { nube: NubeSDK }; // [!code focus]

export function AgeConfirmation({ nube }:AgeConfirmationProps) { // [!code focus]
  return (
    <Checkbox
      id="age-confirmation"
      name="age-confirmation"
      label="Tengo más de 18 años"
      checked={false}
    />
  );
}
```

Luego creamos una función para manejar el evento de selección del checkbox.

```tsx
import { Checkbox } from "@tiendanube/nube-sdk-jsx";
import type { NubeSDK } from "@tiendanube/nube-sdk-types";

export type AgeConfirmationProps = { nube: NubeSDK };

export function AgeConfirmation({ nube }:AgeConfirmationProps) {
  return (
    <Checkbox
      id="age-confirmation"
      name="age-confirmation"
      label="Tengo más de 18 años"
      checked={false}
      onChange={({ value }) => {  // [!code focus]
        if (value) {  // [!code focus]
          nube.send("cart:validate", () => ({  // [!code focus]
            cart: { validation: { status: "success" } },  // [!code focus]
          }));  // [!code focus]
          return;  // [!code focus]
        } // [!code focus]
        // bloquear checkout si el checkbox no está marcado  // [!code focus]
        nube.send("cart:validate", () => ({  // [!code focus]
          cart: {   // [!code focus]
            validation: {  // [!code focus]
              status: "fail",  // [!code focus]
              reason: "Producto solo disponible para mayores de 18 años", // [!code focus]
            },  // [!code focus]
          },  // [!code focus]
        })); // [!code focus]
      }}  // [!code focus]
    />
  );
}
```

## Agregando el componente al checkout

Con el componente creado, podemos agregarlo a la interfaz del checkout. Esto se puede hacer disparando el evento `ui:slot:set` y especificando en qué [slot](/es/docs/ui-slots) se debe renderizar el componente. Para esta app, `after_contact_form` es una buena opción.

Edita el archivo `main.tsx` para incluir el componente en la ubicación elegida.

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
            reason: "Producto solo disponible para mayores de 18 años",
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

## Ejecutando la aplicación

Si aún no has creado una aplicación, accede al Portal del Socio y sigue las instrucciones para [registrar tu primera app](https://dev.tiendanube.com/es/docs/applications/overview#creando-una-aplicación-en-nuvemshop).

![add script](/images/nube-sdk-flag.png)

Puedes activar el `modo desarrollador` para ejecutar tu aplicación localmente. Nuestra plantilla ya incluye un servidor en vivo para ayudarte con esta tarea. Usa el siguiente comando:

```bash
npm run dev
```

Tu aplicación estará disponible en http://localhost:8080/main.min.js. Solo pega esta URL en el portal del socio para ver tu app en acción.

Cuando quieras publicar la versión final, usa el comando:

```bash
npm run build
```

Creará una versión optimizada de tu script en `dist/main.min.js` que puede ser publicada en el portal del socio.

::: info **Sobre pruebas unitarias**

Para mantener esta guía objetiva y enfocada en el flujo principal de desarrollo, no hemos cubierto pruebas automatizadas en este tutorial.
Sin embargo, recomendamos encarecidamente que todas las apps desarrolladas con NubeSDK incluyan pruebas unitarias, especialmente para componentes y lógica de validación.

Todas las plantillas del SDK vienen configuradas con [Vitest](https://vitest.dev/), el mismo framework usado internamente por nuestro equipo. Pronto, publicaremos una guía específica sobre cómo probar aplicaciones NubeSDK — con ejemplos, mejores prácticas y cobertura de casos comunes.
:::

## Conclusión

Con este ejemplo simple, hemos mostrado cómo es posible crear una app con NubeSDK que interactúa con el checkout de manera segura, modular y declarativa.

Partiendo de un requisito real — bloquear la finalización de la compra hasta que el cliente confirme su edad — exploramos los principales conceptos de la plataforma:

- **Slots de UI:** renderizado declarativo de componentes sin acceso directo al DOM.
- **Eventos reactivos:** control del flujo del checkout usando eventos como `checkout:ready` y `cart:validate`.
- **Ejecución aislada:** toda la lógica de la app se ejecuta en un entorno protegido (Web Worker), lo que garantiza seguridad y previsibilidad.

Este tutorial es solo el punto de partida. NubeSDK ofrece una base sólida para desarrollar experiencias avanzadas y personalizadas en tiendas Nuvemshop, como campañas de cross-sell, aplicaciones de cupones, selección de envío y mucho más — todo con un enfoque en seguridad, rendimiento y compatibilidad con el tema de la tienda.

Explora [nuestra documentación](/es/docs/motivation) y sigue construyendo con NubeSDK 🚀
