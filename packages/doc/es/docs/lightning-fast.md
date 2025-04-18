# Súper Rápido

El rendimiento es uno de los pilares fundamentales de NubeSDK. Desde el primer momento de interacción, la arquitectura del SDK está diseñada para ofrecer velocidad y fluidez, incluso en escenarios complejos con múltiples aplicaciones ejecutándose al mismo tiempo.

## Ejecución Paralela con Inicialización Modular

Cada app se carga como un [módulo JavaScript](https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Modules) y se ejecuta dentro de un [Web Worker](https://web.dev/learn/performance/web-worker-overview) aislado, lo que garantiza que su código corra en un hilo separado del de la aplicación principal. Esto evita bloqueos en la interfaz y asegura que operaciones más intensivas —como lógica de recomendaciones, validaciones o cálculos personalizados— no afecten la experiencia del usuario.

Esta combinación de ejecución paralela y aislamiento mejora directamente métricas de rendimiento como el [Time to Interactive (TTI)](https://web.dev/articles/tti) y el [First Contentful Paint (FCP)](https://web.dev/articles/fcp), elementos clave para garantizar una experiencia fluida en dispositivos móviles y conexiones inestables.

## Inicialización Instantánea con SSR

Durante el proceso de carga de la página, NubeSDK inserta el estado inicial de la aplicación directamente en el HTML renderizado por el servidor. Esto garantiza que todos los datos necesarios estén listos en el momento exacto en que las apps comienzan a ejecutarse, evitando solicitudes adicionales y acelerando la respuesta de la interfaz.

## Comunicación Basada en Eventos

NubeSDK adopta un modelo de [pub/sub](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/publish-subscribe.html), en el que las apps se comunican con el host mediante eventos. Esta arquitectura orientada a eventos elimina la necesidad de hacer polling o verificaciones constantes, logrando una comunicación más eficiente, reactiva y escalable.

NubeSDK está diseñado para ejecutarse a máxima velocidad: las apps se cargan rápidamente, se ejecutan de forma aislada e integran de forma inteligente con la plataforma. El resultado es un rendimiento superior, menor latencia y una experiencia de compra impecable.
