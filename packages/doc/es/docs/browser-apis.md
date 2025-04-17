# APIs del Navegador

::: info
Este documento está en desarrollo. Pronto tendremos el contenido completo.
:::

NubeSDK proporciona una interfaz segura y estandarizada para interactuar con características comunes del navegador dentro de Web Workers — un modelo de runtime utilizado para ejecutar apps de socios de forma segura, aislados de la aplicación principal.

Como los Web Workers no tienen acceso directo a muchas características estándar del navegador, NubeSDK ofrece el método `getBrowserAPIs()`, que expone un conjunto de interfaces seguras y de alto nivel que permiten que las apps de socios interactúen con recursos seleccionadas del navegador a través de una capa de API controlada y asíncrona.

Estas abstracciones están diseñadas para alinearse con los principios de NubeSDK de seguridad, consistencia y experiencia del desarrollador — permitiendo integraciones más ricas sin sacrificar control o rendimiento.

Recursos adicionales del navegador se introducirán con el tiempo, siempre siguiendo esta filosofía de acceso seguro y transparente.

## Web Storage API

Las APIs [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) y [sessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage) son parte del contexto `window` del hilo principal y no están disponibles nativamente dentro de Web Workers.

Para proporcionar acceso a estos mecanismos de almacenamiento de forma segura y compatible, NubeSDK expone `asyncLocalStorage` y `asyncSessionStorage` a través del método `getBrowserAPIs()`. Estas interfaces devuelven `promises` y están diseñadas para siguir el modelo de ejecución asincrónico del SDK.

### Cómo Usar

El siguiente ejemplo utiliza el método `setItem` de `asyncSessionStorage` para almacenar un nuevo valor.

```typescript
import type { NubeSDK } from "@tiendanube/nube-sdk-types";

export function App(nube: NubeSDK) {
  const browser = nube.getBrowserAPIs();

  browser.asyncSessionStorage
    .setItem("my_custom_field", "Hello World!")
    .then(() => {
      console.log("Elemento definido en el almacenamiento de sesión");
    });
}
```

El siguiente ejemplo utiliza el método `getItem` de `asyncSessionStorage` para recuperar un valor almacenado.

```typescript title="main.ts"
import type { NubeSDK } from "@tiendanube/nube-sdk-types";

export function App(nube: NubeSDK) {
  const browser = nube.getBrowserAPIs();

  browser.asyncSessionStorage.getItem("my_custom_field").then((value) => {
    console.log("my_custom_field", value);
  });
}
```

### Tiempo de Vida

Tanto `asyncLocalStorage` como `asyncSessionStorage` soportan un parámetro opcional llamado `ttl` (time-to-live), que define cuánto tiempo debe permanecer válido el valor almacenado, en segundos.

Cuando se proporciona, el `ttl` determina el tiempo de expiración para la clave. Una vez que la duración especificada haya pasado, el valor ya no será accesible a través de `getItem` y será tratado como si hubiera sido eliminado.

```typescript title="main.ts"
// Almacenar un valor que expira en 60 segundos
await browser.asyncLocalStorage.setItem("my_custom_field", "Hello World!", 60);
```

Si no se proporciona ningún `ttl`, el valor persistirá indefinidamente, siguiendo el comportamiento predeterminado de `localStorage` y `sessionStorage`. 