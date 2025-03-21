# create-nube-app <a href="https://npmjs.com/package/create-nube-app"><img src="https://img.shields.io/npm/v/create-nube-app" alt="npm package"></a>

**CLI to quickly create NubeSDK applications.**

## About

`create-nube-app` is a command-line tool that allows you to create new NubeSDK applications with an optimized initial configuration. This tool automates the project setup process, including:

- Recommended directory structure
- TypeScript configuration
- Bundler configuration (tsup)
- Required dependencies
- Basic code examples

## Installation

With NPM:

```sh
npm create nube-app
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

After running the command, you'll be guided through an interactive process that allows you to:

1. What is the project's name?
2. Select a template:

### Usage Example

```
$ npm create nube-app
What is the project's name?
Select a template:
    Minimal
❯   Minimal with UI
    Minimal with UI in JSX
```

## Project Structure

After creation, your project will have the following structure:

```
my-nube-app/
├── src/
│   └── main.ts
├── package.json
├── tsconfig.json
├── tsup.config.js
└── biome.json
```

## Available Scripts

The created project includes the following scripts:

- `npm run build` → Builds the project using tsup

## Official Documentation

For more details about NubeSDK and how to build apps, check out our **official documentation**:

[**NubeSDK Documentation**](https://dev.tiendanube.com/docs/applications/nube-sdk/overview)

## Support

- **Questions?** Use [GitHub Issues](https://github.com/TiendaNube/nube-sdk/issues).
- **Found a bug?** Open an issue with a reproducible example.

---

© [Tiendanube / Nuvemshop](https://www.tiendanube.com), 2025. All rights reserved.