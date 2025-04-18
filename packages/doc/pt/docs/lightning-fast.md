# Extremamente Rápido

A performance é um dos pilares centrais do NubeSDK. Desde o primeiro momento de interação, a arquitetura do SDK foi desenhada para proporcionar velocidade e fluidez, mesmo em cenários complexos com múltiplos apps instalados.

## Execução Paralela com Inicialização Modular

Cada app é carregado como um [módulo JavaScript](https://developer.mozilla.org/docs/Web/JavaScript/Guide/Modules) e executado dentro de um [Web Worker](https://web.dev/learn/performance/web-worker-overview) isolado, garantindo que seu código rode em uma thread separada da aplicação principal. Isso evita bloqueios na interface e assegura que operações mais intensas — como lógicas de recomendação, validações ou cálculos personalizados — não impactem a experiência do usuário.

Essa combinação de execução paralela e isolamento contribui diretamente para melhores métricas de performance, como [Time to Interactive (TTI)](https://web.dev/articles/tti) e [First Contentful Paint (FCP)](https://web.dev/articles/fcp), elementos essenciais para garantir uma experiência fluida em dispositivos móveis e conexões instáveis.

## Inicialização Instantânea com SSR

Durante o processo de carregamento da página, o NubeSDK insere o estado inicial da aplicação já no HTML renderizado pelo servidor. Isso garante que os dados estejam prontos para uso no exato momento em que os apps iniciam, evitando requisições adicionais e acelerando a resposta da interface.

## Comunicação Baseada em Eventos

O NubeSDK adota um modelo [pub/sub](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/publish-subscribe.html), no qual os apps se comunicam com o host através de eventos. Essa arquitetura orientada a eventos elimina a necessidade de polling ou verificações constantes, tornando a comunicação mais eficiente, reativa e escalável​

O NubeSDK foi projetado para rodar em velocidade máxima — apps são carregados rapidamente, executados de forma isolada, e integrados de maneira inteligente com a plataforma. Isso garante alta performance, menor latência e uma experiência de compra impecável.