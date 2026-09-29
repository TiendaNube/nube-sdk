# Nube DevTools

**Chrome DevTools extension for debugging and testing NubeSDK apps with real-time insights.**

Nube DevTools is a Chrome extension that provides development tools to help you build and debug apps built with NubeSDK.

## Features

- Modern development stack with Vite and React
- Chrome Extension Manifest v3 compliant
- Hot module replacement for faster development
- Optimized production builds

## Prerequisites

- Node.js >= 14
- Chrome browser (for development and testing)

## Installation

1. Clone the repository
2. Navigate to the project directory:
   ```bash
   cd packages/nube-devtools
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Development

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right corner
   - Click "Load unpacked" and select the `packages/nube-devtools/build` directory

## Building for Production

To create a production-ready build:

```bash
npm run build
```

The build output will be available in the `build` directory, ready for submission to the Chrome Web Store.

## Official Documentation

For more details about NubeSDK and how to build apps, check out our **official documentation**:

🔗 **[NubeSDK Documentation](https://nuvemshop.dev/en-US/apps/nube-sdk/overview)**

- [Getting started](https://nuvemshop.dev/en-US/apps/nube-sdk/getting-started)
  - How to set up the environment and create your first app
- [Events](https://nuvemshop.dev/en-US/apps/nube-sdk/events/overview)
  - All the events your app can send and listen
- [State](https://nuvemshop.dev/en-US/apps/nube-sdk/state/overview)
  - Complete definition of the store data that can be accessed
- [API](https://nuvemshop.dev/en-US/apps/nube-sdk/api/overview)
  - Integration layer with checkout, analytics, and more

## Support

- **Questions?** Use [GitHub Issues](https://github.com/TiendaNube/nube-sdk/issues).
- **Found a bug?** Open an issue with a reproducible example.

---

© [Nuvemshop / Tiendanube](https://nuvemshop.dev), 2026. All rights reserved.
