# Contributing

## Development

### Setup

```bash
# Install dependencies
npm install

# Use correct Node version (if using nvm)
nvm use
```

### Working with Packages

This project uses npm workspaces. Use the `-w` flag to run commands in specific packages:

```bash
# Add a dependency to a specific package
npm install <package> -w packages/ui

# Install only that workspace's dependencies (no package add)
npm install -w packages/ui

# Run tests for a specific package
npm run test -w packages/ui

# Build a specific package
npm run build -w packages/ui

# Run linting for a specific package
npm run check -w packages/ui
```

### Common Commands

```bash
# Install all dependencies
npm install

# Run tests for all packages
npm run test --workspaces

# Build all packages
npm run build --workspaces

# Lint all packages
npm run check --workspaces
```

### Package Structure

- `packages/create-react-app` - CLI to create new App
- `packages/jsx` - 
- `packages/nube-devtools` - 
- `packages/types` - TypeScript type definitions
- `packages/ui` - 

## Commit Messages

This project uses standardized commit messages to automatically generate CHANGELOGs. Follow the conventions below:

### Format

```
<type>(<scope>): <description>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Formatting, whitespace, etc.
- `refactor`: Code refactoring
- `test`: Adding or fixing tests
- `chore`: Maintenance tasks

### Scope

Use the affected package name:

- `create-nube-app`: For changes in `packages/create-nube-app`
- `jsx`: For changes in `packages/jsx`
- `nube-devtools`: For changes in `packages/nube-devtools`
- `types`: For changes in `packages/types`
- `ui`: For changes in `packages/ui`

For multiple packages, separate with comma: `ui,types`

### Examples

```bash
feat(react-adapter): add NumberField component
fix(register): handle undefined apps
docs(runtime): update API documentation
refactor(types): improve interface definitions
feat(ui,types): add amazing component
chore(react-adapter): bump dependencies
```

### Breaking Changes

For breaking changes, add `!` after the scope:

```bash
feat(runtime)!: change API signature
```

Or include `BREAKING CHANGE:` in the commit body for more details.