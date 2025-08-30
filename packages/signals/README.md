# `@tiendanube/nube-sdk-signals`

**Reactive signals library for NubeSDK.**

## About

`@tiendanube/nube-sdk-signals` provides a **reactive signals system** for NubeSDK applications. This package enables creating reactive state that automatically updates when dependencies change, facilitating state management in isolated web worker applications.

Apps in NubeSDK run **inside isolated web workers**, without direct access to the DOM. This package offers a reactive state solution that works safely in this environment.

## Installation

```sh
npm install @tiendanube/nube-sdk-signals
```

## Public API

### Core Functions
- `signal<T>(value: T)` → Creates a reactive signal with initial value
- `computed<T>(fn: () => T, deps?: Signal<unknown>[])` → Creates a computed signal based on dependencies
- `effect(fn: () => void, deps: Signal<unknown>[])` → Executes side effects when dependencies change

### Types
- `Signal<T>` → Type for writable reactive signals
- `ReadonlySignal<T>` → Type for read-only computed signals
- `Subscriber<T>` → Function type for signal subscribers

## Example Usage

```ts
import { signal, computed, effect } from "@tiendanube/nube-sdk-signals";

// Create reactive signals
const count = signal(0);
const name = signal("John");

// Computed signal
const greeting = computed(() => `Hello ${name.value}, you have ${count.value} items`, [name, count]);

// Side effect
effect(() => {
  console.log(greeting.value);
}, [greeting]);

// Update values
count.value = 5; // Logs: "Hello John, you have 5 items"
name.value = "Jane"; // Logs: "Hello Jane, you have 5 items"
```

## Official Documentation

For more details about NubeSDK and how to build apps, check out our **official documentation**:

🔗 **[NubeSDK Documentation](https://dev.tiendanube.com/docs/applications/nube-sdk/overview)**

## Support

- **Questions?** Use [GitHub Issues](https://github.com/TiendaNube/nube-sdk/issues).
- **Found a bug?** Open an issue with a reproducible example.

---

© [Tiendanube / Nuvemshop](https://www.tiendanube.com), 2025. All rights reserved.
