---
'@shopify/shopify-app-remix': major
---

Remove REST entirely.

9 months ago in version 3.5.0 we signalled our intent to remove REST ([Shopify is all-in on GraphQL](https://www.shopify.com/ca/partners/blog/all-in-on-graphql)).  At that time we added the `removeRest` flag to allow the small percentage of Remix apps that use REST to gradually migrate to GraphQL in preparation for this version.

The time has now come to remove REST entirely from the Remix package.  As such, you will need to migrate any remaining REST queries to GraphQL.  

If you previously adopted the `removeRest` flag, you'll need to remove that flag.

BEFORE:

```ts
import {
  shopifyApp,
} from "@shopify/shopify-app-remix/server";

const shopify = shopifyApp({
  future: {
    unstable_newEmbeddedAuthStrategy: true,
    removeRest: true,
  },
  // ...etc
});
```

AFTER:

```ts
import {
  shopifyApp,
} from "@shopify/shopify-app-remix/server";

const shopify = shopifyApp({
  future: {
    unstable_newEmbeddedAuthStrategy: true,
  },
  // ...etc
});
```

If you have any REST queries in your app, you'll need to migrate those to GraphQL.

BEFORE:

```ts
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const {admin} = await authenticate.admin(request);

  const response = await admin.rest.get({
    path: "/customers/count.json",
  });
  const customers = await response.json();

  return json({ customers });
};
```

AFTER:

```ts
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const {admin} = await authenticate.admin(request);

  const response = await admin.graphql(QUERY);
  const customers = await response.json();

  return json({ customers });
};
```

Please see the [REST to GraphQL Migration guide](https://shopify.dev/docs/apps/build/graphql/migrate) for more detailed REST to GraphQL examples.
