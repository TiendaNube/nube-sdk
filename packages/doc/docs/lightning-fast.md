# Lightning Fast

Performance is one of the core pillars of NubeSDK. From the very first interaction, the SDK's architecture is designed to deliver speed and fluidity — even in complex scenarios with multiple apps running at the same time.

## Parallel Execution with Modular Initialization

Each app is loaded as a [JavaScript module](https://developer.mozilla.org/docs/Web/JavaScript/Guide/Modules) and executed within an isolated [Web Worker](https://web.dev/learn/performance/web-worker-overview), ensuring that the code runs in a separate thread from the main application. This prevents UI blocking and ensures that heavier operations — like recommendation logic, validations, or custom calculations — don’t affect the user experience.

This combination of parallel execution and isolation directly improves performance metrics such as [Time to Interactive (TTI)](https://web.dev/articles/tti) and [First Contentful Paint (FCP)](https://web.dev/articles/fcp), which are essential to delivering a smooth experience on mobile devices and unstable connections.

## Instant Initialization with SSR

During the page load process, NubeSDK injects the application’s initial state directly into the server-rendered HTML. This ensures that all necessary data is ready at the exact moment apps start running — avoiding additional requests and accelerating the interface response.

## Event-Based Communication

NubeSDK follows a [pub/sub](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/publish-subscribe.html) model, where apps communicate with the host through events. This event-driven architecture eliminates the need for polling or constant checks, making communication more efficient, reactive, and scalable.

NubeSDK is built to run at full speed — apps load quickly, run in isolation, and integrate intelligently with the platform. This results in high performance, lower latency, and a flawless shopping experience.
