# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Root-level Commands
```bash
# Install dependencies for all packages
npm install

# Run tests across all packages
npm test

# Build all packages
npm build

# Check code style and linting
npm run check

# Fix code style and linting issues
npm run fix
```

### Package-specific Commands
The monorepo uses npm workspaces. For individual packages:

```bash
# Build a specific package
npm run build --workspace packages/ui
npm run build --workspace packages/jsx
npm run build --workspace packages/types
npm run build --workspace packages/create-nube-app

# Run tests for a specific package
npm run test --workspace packages/ui

# Lint and format specific package
npm run check --workspace packages/ui
npm run check:fix --workspace packages/ui

# Test with watch mode (UI package only)
npm run test:watch --workspace packages/ui

# Test with coverage (UI package only)
npm run test:coverage --workspace packages/ui
```

### Development Tools
```bash
# Create a new Nube app (scaffolding)
npm create nube-app@latest

# Development server for devtools extension
npm run dev --workspace packages/nube-devtools
```

## Architecture Overview

### Monorepo Structure
This is a **TypeScript monorepo** with npm workspaces containing the following key packages:

- **`@tiendanube/nube-sdk-types`** - Core TypeScript definitions and interfaces
- **`@tiendanube/nube-sdk-ui`** - Declarative UI component library  
- **`@tiendanube/nube-sdk-jsx`** - JSX runtime and components
- **`create-nube-app`** - CLI scaffolding tool
- **`nube-devtools`** - Chrome extension for debugging

### Core Architecture Concepts

**NubeSDK** enables third-party apps to run in **isolated web workers** within the Nuvemshop/Tiendanube platform, providing:

1. **Sandboxed Execution**: Apps run in web workers without direct DOM access
2. **Event-Driven Communication**: Apps communicate through a message-passing system
3. **Declarative UI**: Components are defined declaratively and rendered by the platform
4. **Immutable State**: All state is immutable and managed by the SDK

### Key Interfaces

**NubeSDK Instance**:
- `on(event, listener)` - Register event listeners
- `send(event, modifier)` - Send events and optionally modify state  
- `render(slot, component)` - Render components to UI slots
- `getState()` - Access current immutable state

**State Structure**:
- `cart` - Shopping cart data and validation
- `customer` - Customer information
- `payment` - Payment method details
- `shipping` - Shipping options and selections
- `store` - Store configuration and metadata
- `location` - Current page/URL context
- `ui` - Dynamic UI components and slots

### Event System

**Sendable Events** (app → platform):
- `cart:add`, `cart:remove`, `cart:validate`
- `ui:slot:set` - Update UI slots
- `config:set` - Update app configuration
- `coupon:add`, `coupon:remove`
- Custom events: `custom:namespace:event`

**Listenable Events** (platform → app):
- `page:loaded`, `checkout:ready`, `checkout:success`
- `cart:update`, `cart:add:success`, `cart:add:fail`
- `customer:update`, `payment:update`, `shipping:update`
- All sendable events for debugging/monitoring

### Development Workflow

1. **Create New Apps**: Use `npm create nube-app@latest`
2. **Build Components**: Use declarative UI or JSX syntax
3. **Handle Events**: Listen for platform events and send responses
4. **Test Locally**: Use nube-devtools Chrome extension
5. **Deploy**: Apps are deployed through the Nuvemshop partner platform

### Tooling Stack

- **Build**: tsup (TypeScript bundler)
- **Testing**: Vitest 
- **Linting**: Biome (replaces ESLint + Prettier)
- **Types**: TypeScript 5.6+
- **CI/CD**: CircleCI with automated NPM publishing

### Worker Thread Communication Flow

Apps communicate with the platform through a multi-layer message system:
1. App sends event to NubeSDK instance in worker
2. Worker forwards via postMessage to main thread interceptor  
3. Interceptor converts to platform event system
4. Platform processes and sends response back through same chain

This ensures secure, isolated execution while maintaining rich platform integration.
