# Seguro por Design

Um dos conceitos mais importantes do NubeSDK é:

> _"Cada aplicativo tem seu próprio ambiente de execução"_.

Isso é possível através da criação de um [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) para cada aplicativo instalado na loja, permitindo assim a execução paralela em um ambiente isolado sem interferência de agentes externos.

![arquitetura baseada em web worker](/images/worker-arch.svg)

O ambiente do web worker é preparado pelo SDK e então o aplicativo é carregado e executado como um [Módulo JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules). Por esse motivo, todo aplicativo desenvolvido com NubeSDK tem um ponto de entrada único, a função `App`.

```javascript
export function App(nube) {
  // Seu código começa aqui!
}
```

Para evitar que o aplicativo precise lidar com os detalhes de implementação do web worker, a função `App` recebe uma instância do SDK que atua como canal de comunicação seguro entre o aplicativo e a loja.

