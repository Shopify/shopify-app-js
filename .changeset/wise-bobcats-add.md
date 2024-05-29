---
'@shopify/shopify-app-remix': major
---

Apps can no longer import server-side functions using the following statements:

```diff
import '@shopify/shopify-app-remix/adapters/node';
+ import {shopifyApp} from '@shopify/shopify-app-remix';
```
With the addition of React component to this package, we've separated the exports between server and react code, as in:

```diff
import '@shopify/shopify-app-remix/server/adapters/node';
+ import {shopifyApp} from '@shopify/shopify-app-remix/server';
- import {shopifyApp} from '@shopify/shopify-app-remix';
import {AppProvider} from '@shopify/shopify-app-remix/react';
```
