# @shopify/shopify-app-router

React Router version of shopify-app-remix.

This package provides React Router implementations of the same APIs available in shopify-app-remix, allowing you to build Shopify apps using React Router instead of Remix.

## Installation

```bash
npm install @shopify/shopify-app-router
# or
yarn add @shopify/shopify-app-router
# or
pnpm add @shopify/shopify-app-router
```

## Usage

```jsx
import {
  Link,
  useLoaderData,
  json
} from '@shopify/shopify-app-router';

// Use just like you would with shopify-app-remix
```

## API

This package provides React Router equivalents to Remix APIs used in shopify-app-remix.

### Components
- `Link`
- `NavLink`
- `Form`
- `Outlet`

### Hooks
- `useLoaderData`
- `useActionData`
- `useSubmit`
- `useParams`
- `useNavigation` (replacement for useTransition)

### Functions
- `json`
- `redirect`
