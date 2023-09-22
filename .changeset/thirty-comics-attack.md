---
'@shopify/shopify-app-remix': minor
---

Added the storefront GraphQL client.

The storefront API client can be accessed in two ways

<details>
  <summary>App Proxy</summary>

```ts
import {json} from '@remix-run/node';
import {authenticate} from '~/shopify.server';

export async function loader({request}) {
  const {storefront} = await authenticate.public.appProxy(request);
  const response = await storefront.graphql('{blogs(first: 10) {nodes{id}}}');

  return json(await response.json());
}
```

</details>

<details>
  <summary>Unauthenticated Storefront</summary>

```ts
import {json} from '@remix-run/node';
import {unauthenticated} from '~/shopify.server';
import {customAuthenticateRequest} from '~/helpers';

export async function loader({request}) {
  await customAuthenticateRequest(request);

  const {storefront} = await unauthenticated.storefront(
    'my-shop.myshopify.com',
  );
  const response = await storefront.graphql('{blogs(first: 10) {nodes{id}}}');

  return json(await response.json());
}
```

</details>
