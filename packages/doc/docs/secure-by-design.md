# Secure by Design

One of the most important concepts of NubeSDK is:

> _"Each app has its own runtime environment"_.

This is possible by creating a [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) for each app installed in the store, thus allowing parallel execution in a sandbox without interference from external agents.

![web worker based architecture](/images/worker-arch.svg)

The web worker environment is prepared by the SDK and then the app is loaded and executed as an [JavaScript Module](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules). For this reason, every app developed with NubeSDK has a unique entry point, the `App` function.

```javascript
export function App(nube) {
  // Your code start here!
}
```

To avoid the app from having to deal with the implementation details of the web worker, the `App` function receives an instance of the SDK that acts as a secure communication channel between the app and the store.
