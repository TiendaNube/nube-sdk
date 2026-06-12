# create-nube-app <a href="https://npmjs.com/package/create-nube-app"><img src="https://img.shields.io/npm/v/create-nube-app" alt="npm package"></a>

**CLI to quickly create NubeSDK applications.**

## About

`create-nube-app` is a command-line tool that allows you to create new NubeSDK applications with an optimized initial configuration. This tool automates the project setup process, including:

- Recommended directory structure
- TypeScript configuration
- Bundler configuration (tsup)
- Required dependencies
- Testing setup (Vitest)
- Linting and formatting (Biome)
- Basic code examples

## Installation

With NPM:

```sh
npm create nube-app@latest
```

With Yarn:

```sh
yarn create nube-app
```

With PNPM:

```sh
pnpm create nube-app
```

## Usage

After running the command, you'll be guided through an interactive process:

1. Choose the project name
2. Select a template
3. Initialize a git repository

### Usage Example

```
$ npm create nube-app@latest

◆  What is the project's name?
│  my-nube-app
│
◆  Select a template:
│  ● Minimal
│  ○ Minimal with UI
│  ○ Minimal with UI in JSX
│
◇  Initialize git repository?
│  Yes
```

## Project Structure

After creation, your project will have the following structure:

```
my-nube-app/
├── .vscode/
│   ├── extensions.json
│   └── settings.json
├── src/
│   ├── main.ts
│   └── main.test.ts
├── .gitignore
├── biome.json
├── package.json
├── README.md
├── tsconfig.json
├── tsup.config.js
└── vitest.config.ts
```

## Available Scripts

The created project includes the following scripts:

- `npm run build` → Builds the project using tsup
- `npm run dev` → Starts the project in development mode with hot reloading and source maps
- `npm run test` → Runs tests with Vitest
- `npm run test:watch` → Runs tests in watch mode
- `npm run test:coverage` → Runs tests with coverage report
- `npm run lint` → Checks code with Biome
- `npm run format` → Formats code with Biome

## Official Documentation

For more details about NubeSDK and how to build apps, check out our **official documentation**:

[**NubeSDK Documentation**](https://dev.tiendanube.com/docs/applications/nube-sdk/overview)

## Support

- **Questions?** Use [GitHub Issues](https://github.com/TiendaNube/nube-sdk/issues).
- **Found a bug?** Open an issue with a reproducible example.

---

© [Tiendanube / Nuvemshop](https://www.tiendanube.com), 2026. All rights reserved.