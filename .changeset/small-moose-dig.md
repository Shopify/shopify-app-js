---
'@shopify/shopify-api': patch
---

Add Web API and CF Worker adapter intialized constants for aggressive tree-shakers

For example with the web-api adapter:

```ts
// Instead of just:
import '@shopify/shopify-api/adapters/web-api';

// You can now also import:
import { webApiAdapterInitialized } from '@shopify/shopify-api/adapters/web-api';
import { shopifyApi } from '@shopify/shopify-api';

// And check the adapter is initialized, which forces bundlers to keep the import
if (!webApiAdapterInitialized) {
  throw new Error('Failed to initialize web API adapter');
}
```