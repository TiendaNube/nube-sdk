# Age Confirmation

In this example, we'll create an application that adds a [checkbox](/docs/components/checkbox) to the checkout for users to confirm they are over 18 years old.

## Project Setup

Make sure you have [Node.js®](https://nodejs.org) version 16 or higher installed on your computer.

Let's start by creating the initial project structure with the NubeSDK CLI. Execute the following command:

```bash
npm create nube-app@latest
```
::: tip
If this is your first time using the CLI or if a new version is available, you'll be prompted to confirm the installation. Just press `y` to proceed.
:::

In the options that appear, set the app name as `age-confirmation` and choose the template with `JSX`.

![CLI output](/images/examples/age-app-cli.png)

We recommend using [VS Code](https://code.visualstudio.com/) as your code editor, so let's use it to open the project.

![install vscode extensions](/images/examples/age-app-vscode-1.png)

::: tip
Our templates include recommended extensions to assist in development.
:::

![vscode recommended extensions](/images/examples/vscode-recommended.png)

## App Initialization

Our application needs to inform the store that it's responsible for performing checkout validation. Let's start by editing the `src/main.tsx` file, removing the template content and adding this initial configuration.

```tsx
import type { NubeSDK } from "@tiendanube/nube-sdk-types";
import { MyCustomField } from "./components/MyCustomField"; // [!code --]

export function App(nube: NubeSDK) {
  nube.send("ui:slot:set", () => ({ // [!code --]
    ui: { // [!code --]
      slots: { // [!code --]
        after_line_items: <MyCustomField />, // [!code --]
      }, // [!code --]
    }, // [!code --]
  })); // [!code --]
  nube.send("config:set", () => ({ // [!code ++]
    config: { // [!code ++]
      has_cart_validation: true, // [!code ++]
    }, // [!code ++]
  })); // [!code ++]
}
```

## Checkout Blocking

To ensure users can only proceed with their purchase after confirming their age, we'll mark the cart as "invalid" as soon as the checkout starts.

First, let's create a validation to ensure the customer is on the initial checkout page. I'll create a file at `src/utils/page.ts` for this function.

```tsx
import type { AppLocation } from "@tiendanube/nube-sdk-types";

export function isStartPage(location: AppLocation) {
  return location.page.type === "checkout" && location.page.data.step === "start";
}
```

Now we can use this validation in the `main.tsx` file to require confirmation in the cart using the [`cart:validate`](/docs/events#cart-validate) event.

```tsx
import type { NubeSDK } from "@tiendanube/nube-sdk-types";
import { isStartPage } from "./utils/page";

export function App(nube: NubeSDK) {
  nube.send("config:set", () => ({
    config: {
      has_cart_validation: true,
    },
  }));

  nube.on("checkout:ready", ({ location }) => {
    if(isStartPage(location)) { // [!code focus]
      nube.send("cart:validate", () => ({ // [!code focus]
        cart: { // [!code focus]
          validation: { // [!code focus]
            status: "fail", // [!code focus]
            reason: "Product only available for users over 18 years old", // [!code focus]
          }, // [!code focus]
        }, // [!code focus]
      })); // [!code focus]
    } // [!code focus]
  });
}
```

::: tip
The `checkout:ready` event triggers whenever the customer changes pages in the checkout, ensuring the verification will be executed even if the user navigates between checkout steps.
:::

## Creating the Confirmation Component

To allow users to confirm their age, we'll use a [Checkbox](/docs/components/checkbox) that changes the cart validation state when selected.

In `src/components/`, create a new file `AgeConfirmation.tsx`.

```tsx
import { Checkbox } from "@tiendanube/nube-sdk-jsx";

export function AgeConfirmation() {
  return (
    <Checkbox
      id="age-confirmation"
      name="age-confirmation"
      label="I am over 18 years old"
      checked={false}
    />
  );
}
```

Now we need to make the checkbox trigger a new event when selected. The simplest way to do this is by receiving a NubeSDK instance as a component property.

```tsx
import { Checkbox } from "@tiendanube/nube-sdk-jsx";
import type { NubeSDK } from "@tiendanube/nube-sdk-types"; // [!code focus]

export type AgeConfirmationProps = { nube: NubeSDK }; // [!code focus]

export function AgeConfirmation({ nube }:AgeConfirmationProps) { // [!code focus]
  return (
    <Checkbox
      id="age-confirmation"
      name="age-confirmation"
      label="I am over 18 years old"
      checked={false}
    />
  );
}
```

Then we create a function to handle the checkbox selection event.

```tsx
import { Checkbox } from "@tiendanube/nube-sdk-jsx";
import type { NubeSDK } from "@tiendanube/nube-sdk-types";

export type AgeConfirmationProps = { nube: NubeSDK };

export function AgeConfirmation({ nube }:AgeConfirmationProps) {
  return (
    <Checkbox
      id="age-confirmation"
      name="age-confirmation"
      label="I am over 18 years old"
      checked={false}
      onChange={({ value }) => {  // [!code focus]
        if (value) {  // [!code focus]
          nube.send("cart:validate", () => ({  // [!code focus]
            cart: { validation: { status: "success" } },  // [!code focus]
          }));  // [!code focus]
          return;  // [!code focus]
        } // [!code focus]
        // block checkout if checkbox is not checked  // [!code focus]
        nube.send("cart:validate", () => ({  // [!code focus]
          cart: {   // [!code focus]
            validation: {  // [!code focus]
              status: "fail",  // [!code focus]
              reason: "Product only available for users over 18 years old", // [!code focus]
            },  // [!code focus]
          },  // [!code focus]
        })); // [!code focus]
      }}  // [!code focus]
    />
  );
}
```

## Adding the Component to Checkout

With the component created, we can add it to the checkout interface. This can be done by triggering the `ui:slot:set` event and specifying which [slot](/docs/ui-slots) the component should be rendered in. For this app, `after_contact_form` is a good choice.

Edit the `main.tsx` file to include the component in the chosen location.

```tsx
import type { NubeSDK } from "@tiendanube/nube-sdk-types";
import { isStartPage } from "./utils/page";
import { AgeConfirmation } from "./components/AgeConfirmation";  // [!code focus]

export function App(nube: NubeSDK) {
  nube.send("config:set", () => ({
    config: {
      has_cart_validation: true,
    },
  }));

  nube.on("checkout:ready", ({ location }) => {
    if(isStartPage(location)) {
      nube.send("cart:validate", () => ({
        cart: {
          validation: {
            status: "fail",
            reason: "Product only available for users over 18 years old",
          },
        },
      }));

      nube.send("ui:slot:set", () => ({ // [!code focus]
        ui: {  // [!code focus]
          slots: {  // [!code focus]
            after_contact_form: <AgeConfirmation nube={nube} />  // [!code focus]
          }  // [!code focus]
        }  // [!code focus]
      }));  // [!code focus]
    }
  });
}
```

## Running the App

If you don't have an application created yet, access the Partner Portal and follow the instructions to [register your first app](https://dev.tiendanube.com/docs/applications/overview#creating-an-application-in-nuvemshop).

![add script](/images/nube-sdk-flag.png)

You can activate the `developer mode` to run your application locally. Our template already includes a live server to help you with this task. Use the following command:

```bash
npm run dev
```

Your application will be available at http://localhost:8080/main.min.js. Just paste this URL in the partner portal to see your app in action.

When you want to publish the final version, use the command:

```bash
npm run build
```

It will create an optimized version of your script in `dist/main.min.js` that can be published in the partner portal.

::: info **About Unit Tests**

To keep this guide objective and focused on the main development flow, we haven't covered automated tests in this tutorial.
However, we strongly recommend that all apps developed with NubeSDK include unit tests, especially for components and validation logic.

All SDK templates come configured with [Vitest](https://vitest.dev/), the same framework used internally by our team. Soon, we'll publish a specific guide on how to test NubeSDK applications — with examples, best practices, and coverage of common cases.
:::

## Conclusion

With this simple example, we've shown how it's possible to create an app with NubeSDK that interacts with the checkout in a secure, modular, and declarative way.

Starting from a real requirement — blocking the completion of the purchase until the customer confirms their age — we explored the main concepts of the platform:

- **UI Slots:** declarative rendering of components without direct DOM access.
- **Reactive Events:** controlling the checkout flow using events like `checkout:ready` and `cart:validate`.
- **Isolated Execution:** all app logic runs in a protected environment (Web Worker), ensuring security and predictability.

This tutorial is just the starting point. NubeSDK provides a solid foundation for developing advanced and customized experiences in Nuvemshop stores, such as cross-sell campaigns, coupon applications, shipping selection, and much more — all with a focus on security, performance, and compatibility with the store's theme.

Explore [our documentation](/docs/motivation) and keep building with NubeSDK 🚀