# Seguro por Diseño

Uno de los conceptos más importantes de NubeSDK es:

> _"Cada aplicación tiene su propio entorno de ejecución"_.

Esto es posible mediante la creación de un [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) para cada aplicación instalada en la tienda, permitiendo así la ejecución paralela en un entorno aislado sin interferencia de agentes externos.

![arquitectura basada en web worker](/images/worker-arch.svg)

El entorno del web worker es preparado por el SDK y luego la aplicación se carga y ejecuta como un [Módulo JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules). Por esta razón, toda aplicación desarrollada con NubeSDK tiene un punto de entrada único, la función `App`.

```javascript
export function App(nube) {
  // ¡Tu código comienza aquí!
}
```

Para evitar que la aplicación tenga que lidiar con los detalles de implementación del web worker, la función `App` recibe una instancia del SDK que actúa como canal de comunicación seguro entre la aplicación y la tienda.
