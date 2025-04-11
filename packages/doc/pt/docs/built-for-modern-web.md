# Feito para a Web Moderna

O NubeSDK foi pensado para o presente e o futuro do desenvolvimento web. Com uma arquitetura moderna e centrada em segurança, desempenho e escalabilidade, ele oferece aos parceiros uma base sólida para criar experiências avançadas, sem abrir mão de controle e previsibilidade.

## Isolamento por design

Todos os apps são executados em escopos totalmente isolados, utilizando **Web Workers** para garantir que cada integração ocorra de forma segura, sem afetar a experiência da loja ou de outros apps. Essa abordagem evita conflitos, reforça a segurança e permite que múltiplos apps rodem em paralelo sem interferência entre si.

## UI como dado

A interface dos apps é descrita por estruturas de dados declarativas, interpretadas em tempo real pela plataforma. Esse modelo permite que os apps definam elementos visuais de forma segura, padronizada e sem dependência do DOM. Para os desenvolvedores que preferem, também há suporte opcional a JSX como uma camada de ergonomia adicional.

## Padrões da Web

O SDK oferece ferramentas e APIs alinhadas com práticas atuais — incluindo integração com **storage controlado**, **sistema de eventos assíncronos**, e **renderização dinâmica via slots**, facilitando a criação de experiências interativas com menos acoplamento e mais controle sobre o comportamento do app.


## Consistência de design

A estilização no NubeSDK segue um modelo **declarativo**, com a abordagem de **CSS-in-JS**. Os componentes já são integrados nativamente ao tema da loja, o que garante uma aparência visual consistente **sem exigir nenhum esforço adicional do desenvolvedor**. Quando necessário, é possível personalizar estilos utilizando **objetos de estilo reutilizáveis** e **variáveis de tema expostas pela plataforma**, mantendo a coerência visual e a adaptabilidade do app.

---

Essa abordagem permite que os apps criados com NubeSDK sejam confiáveis, rápidos, seguros — e principalmente, compatíveis com a forma como a web é construída hoje.
