---
'@shopify/shopify-app-remix': minor
---

Added a way to get an admin context without authenticating.

**Warning** This should only be used for Requests that do not originate from Shopify.
You must do your own authentication before using this method.

```ts
// app/shopify.server.ts
import {shopifyApp} from '@shopify/shopify-app-remix';
import {restResources} from '@shopify/shopify-api/rest/admin/2023-04';

const shopify = shopifyApp({
  restResources,
  // ...etc
});

export default shopify;

// app/routes/\/.jsx
import {json} from '@remix-run/node';
import {authenticateExternalRequest} from '~/helpers/authenticate';
import shopify from '../../shopify.server';

export async function loader({request}) {
  const shop = await authenticateExternalRequest(request);
  const {admin} = await shopify.unauthenticated.admin(shop);

  return json(await admin.rest.resources.Product.count({session}));
}
```
