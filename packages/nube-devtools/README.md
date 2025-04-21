## Nube DevTools

Nube DevTools is a Chrome extension that provides development tools to help you build and debug apps built with Nube SDK.

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
