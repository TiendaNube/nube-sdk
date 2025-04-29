# DevTools Overview

Nube DevTools is a Chrome extension developed to improve the debugging and monitoring process of applications built with NubeSDK.

Install Nube DevTools from the [Chrome Web Store](https://www.google.com).

You can open Chrome DevTools on any web page by pressing `F12` or `Ctrl+Shift+I` (Windows or Linux) and `Fn+F12` or `Cmd+Option+I` (Mac).
Once browser DevTools is open and Nube DevTools is installed, you can find it under the "NubeSDK" tab.

![devtools apps](/devtools-apps.png)

# Open your application

When you open the extension, you'll see some additional sections.

| Sections                                 | Details |
|:---                                      |:---     |
| [Apps](devtools#components) | Displays a detailed list of apps built using NubeSDK, providing information about their current state and ongoing activities. |
| [Components](devtools#components) | Provides a comprehensive view of all Components and their available slots, allowing developers to inspect and manage component configurations. |
| [Events](devtools#events) | Shows all events exchanged between the apps and the main page, making it easier to track communications and identify specific actions. |
| [Storage](devtools#storage) | Logs interactions with storage mechanisms `localStorage` and `sessionStorage`, enabling the monitoring of data changes and access events. |

## Apps

This section displays a detailed list of apps built using NubeSDK. The list also indicates whether an app is running in dev mode.

![devtools apps](/devtools-apps.png)

When you click on an individual app in the Apps section, you will see additional details about that app:

- **ID:** A unique identifier for the specific app instance.
- **Regitered:** Indicates whether the app has been successfully registered.
- **Script:** Displays the script that is running for the app.

For more details on how to run your app locally and explore these features, see the [Run your app locally](getting-started#run-your-app-locally). section.

## Components

This section provides a comprehensive view of all components rendered by NubeSDK apps, grouped by app and organized by their location in the interface (slots). This makes it easier to understand how each app builds its UI and where each element is positioned.

![devtools components](/devtools-components.png)

For each component, you can:

* **Inspect its structure:** View the component tree and nested elements.
* **See the component type:** Like Box, Button, Text, Field, and others.
* **Explore slots**: See which components are rendered in which predefined UI slots like `before_main_content` or `after_line_items`.

## Events

This section logs and displays all events exchanged between the apps and the main page in real time. It helps developers monitor the sequence of events, understand how the apps interact with the NubeSDK, and diagnose issues by inspecting state transitions as they occur.

![devtools events](/devtools-events.png)

In the events screen, you can see the name of each event. When you click on an individual event, the detailed view reveals the state of the NubeSDK at that moment.

## Storage

This section displays a list of all storage events occurring in real-time, capturing interactions with both `localStorage` and `sessionStorage`. When you select an individual storage event, you'll see detailed information, including the method, key, and value associated with the event.

![devtools storage](/devtools-storage.png)

For more information on how to access the browser APIs for `localStorage` and `sessionStorage`, please refer to the [Browser API's](browser-apis) documentation.
