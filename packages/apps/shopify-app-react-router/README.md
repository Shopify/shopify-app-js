# Shopify App React Router

> 🧩 A React Router v7 package for building Shopify apps

This package is a drop-in replacement for `@shopify/shopify-app-remix` that uses React Router v7 instead of Remix. It provides the same functionality and API as the Remix package, but with React Router v7 under the hood.

## Installation

```bash
npm install @shopify/shopify-app-react-router
```

or

```bash
yarn add @shopify/shopify-app-react-router
```

or

```bash
pnpm add @shopify/shopify-app-react-router
```

## Usage

The API is designed to be compatible with `@shopify/shopify-app-remix`, which means you can replace the imports in your existing Shopify app with the corresponding imports from this package.

```typescript
// Instead of
import { shopifyApp } from '@shopify/shopify-app-remix';

// Use
import { shopifyApp } from '@shopify/shopify-app-react-router/server';
```

## Features

- Auth management with Shopify
- Session handling
- API clients for Admin and Storefront APIs
- UI components for your Shopify app
- React Router v7 integration

## Contributing

For more information on developing and contributing to this package, see the [contributing guide](../../CONTRIBUTING.md).

## License

MIT © Shopify 