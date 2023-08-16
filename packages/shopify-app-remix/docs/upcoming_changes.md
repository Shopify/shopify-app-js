# Upcoming breaking changes

This file contains every breaking change that's currently planned for this package.
You can use it as a guide for migrating your app, and ensuring you're ready for the next big migration.

> **Note**: Every change in this file comes with a deprecated alternative for apps that haven't been updated yet.
> Our goal is to give developers as much time as possible to prepare for changes to reduce the burden of staying up to date.

## Root import path deprecation

In the current version, apps can import server-side functions using the following statements:

```ts
import '@shopify/shopify-app-remix/adapters/node';
import {shopifyApp} from '@shopify/shopify-app-remix';
```

With the addition of React component to this package, we'll start having full separation between server and react code, as in:

```ts
import '@shopify/shopify-app-remix/server/adapters/node';
import {shopifyApp} from '@shopify/shopify-app-remix/server';
import {AppProvider} from '@shopify/shopify-app-remix/react';
```
