# @shopify/shopify-app-remix-extended

This package re-exports all functionality from [@shopify/shopify-app-remix](https://github.com/Shopify/shopify-app-js/tree/main/packages/apps/shopify-app-remix) providing a foundation for extended functionality.

## Installation

```bash
npm install @shopify/shopify-app-remix-extended
# or
yarn add @shopify/shopify-app-remix-extended
# or 
pnpm add @shopify/shopify-app-remix-extended
```

## Current Features

This package currently provides all the same functionality as `@shopify/shopify-app-remix` through re-exports. Future versions will add extended functionality.

## Usage

Use this package exactly as you would use `@shopify/shopify-app-remix`:

```typescript
// Server-side imports
import { shopifyApp } from '@shopify/shopify-app-remix-extended/server';

// React components
import { Provider } from '@shopify/shopify-app-remix-extended/react';
```

## Migrating from @shopify/shopify-app-remix

If you're already using `@shopify/shopify-app-remix`, you can easily migrate to this package by:

1. Installing this package
2. Updating your imports from `@shopify/shopify-app-remix` to `@shopify/shopify-app-remix-extended`

## License

MIT 