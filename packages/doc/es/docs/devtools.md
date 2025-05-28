# Descripción General de DevTools

Nube DevTools es una extensión de Chrome desarrollada para mejorar el proceso de depuración y monitoreo de aplicaciones construidas con NubeSDK.

Instala Nube DevTools desde la [Chrome Web Store](https://www.google.com).

Puedes abrir Chrome DevTools en cualquier página web presionando `F12` o `Ctrl+Shift+I` (Windows o Linux) y `Fn+F12` o `Cmd+Option+I` (Mac).
Una vez que el DevTools del navegador esté abierto y Nube DevTools esté instalado, podrás encontrarlo en la pestaña "NubeSDK".

![devtools apps](/devtools-apps.png)

# Abre tu aplicación

Cuando abras la extensión, verás algunas secciones adicionales.

| Secciones                                 | Detalles |
|:---                                      |:---     |
| [Apps](devtools#components) | Muestra una lista detallada de aplicaciones construidas usando NubeSDK, proporcionando información sobre su estado actual y actividades en curso. |
| [Components](devtools#components) | Proporciona una vista completa de todos los Componentes y sus slots disponibles, permitiendo a los desarrolladores inspeccionar y gestionar configuraciones de componentes. |
| [Events](devtools#events) | Muestra todos los eventos intercambiados entre las aplicaciones y la página principal, facilitando el seguimiento de las comunicaciones y la identificación de acciones específicas. |
| [Storage](devtools#storage) | Registra las interacciones con los mecanismos de almacenamiento `localStorage` y `sessionStorage`, permitiendo el monitoreo de cambios de datos y eventos de acceso. |

## Apps

Esta sección muestra una lista detallada de aplicaciones construidas usando NubeSDK. La lista también indica si una aplicación está ejecutándose en modo de desarrollo.

![devtools apps](/devtools-apps.png)

Cuando haces clic en una aplicación individual en la sección Apps, verás detalles adicionales sobre esa aplicación:

- **ID:** Un identificador único para la instancia específica de la aplicación.
- **Registered:** Indica si la aplicación ha sido registrada exitosamente.
- **Script:** Muestra el script que se está ejecutando para la aplicación.

Para más detalles sobre cómo ejecutar tu aplicación localmente y explorar estas características, consulta la sección [Ejecuta tu aplicación localmente](getting-started#run-your-app-locally).

## Components

Esta sección proporciona una vista completa de todos los componentes renderizados por las aplicaciones de NubeSDK, agrupados por aplicación y organizados por su ubicación en la interfaz (slots). Esto facilita la comprensión de cómo cada aplicación construye su UI y dónde se posiciona cada elemento.

![devtools components](/devtools-components.png)

Para cada componente, puedes:

* **Inspeccionar su estructura:** Ver el árbol de componentes y elementos anidados.
* **Ver el tipo de componente:** Como Box, Button, Text, Field, y otros.
* **Explorar slots:** Ver qué componentes se renderizan en qué slots predefinidos de la UI como `before_main_content` o `after_line_items`.

## Events

Esta sección registra y muestra todos los eventos intercambiados entre las aplicaciones y la página principal en tiempo real. Ayuda a los desarrolladores a monitorear la secuencia de eventos, entender cómo las aplicaciones interactúan con NubeSDK y diagnosticar problemas inspeccionando las transiciones de estado a medida que ocurren.

![devtools events](/devtools-events.png)

En la pantalla de eventos, puedes ver el nombre de cada evento. Cuando haces clic en un evento individual, la vista detallada revela el estado de NubeSDK en ese momento.

## Storage

Esta sección muestra una lista de todos los eventos de almacenamiento que ocurren en tiempo real, capturando interacciones tanto con `localStorage` como con `sessionStorage`. Cuando seleccionas un evento de almacenamiento individual, verás información detallada, incluyendo el método, la clave y el valor asociados con el evento.

![devtools storage](/devtools-storage.png)

Para más información sobre cómo acceder a las APIs del navegador para `localStorage` y `sessionStorage`, consulta la documentación de [APIs del Navegador](browser-apis). 