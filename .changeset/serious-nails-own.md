---
'@shopify/shopify-app-remix': minor
---

Added support for `future` flags in the `shopifyApp` function, with a `v3_webhookContext` flag to have `authenticate.webhook` return a standard `admin` context, instead of a different type.

Apps can opt in to the new future at any time, so this is not a breaking change (yet).

<details>
  <summary>See an example</summary>

Without the `v3_webhookContext` flag, `graphql` provides a `query` function that takes the query string as the `data` param.
When using variables, `data` needs to be an object containing `query` and `variables`.

```ts
import {json, ActionFunctionArgs} from '@remix-run/node';
import {authenticate} from '../shopify.server';

export async function action({request}: ActionFunctionArgs) {
  const {admin} = await authenticate.webhook(request);

  const response = await admin?.graphql.query<any>({
    data: {
      query: `#graphql
      mutation populateProduct($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
          }
        }
      }`,
      variables: {input: {title: 'Product Name'}},
    },
  });

  const productData = response?.body.data;
  return json({data: productData.data});
}
```

With the `v3_webhookContext` flag enabled, `graphql` _is_ a function that takes in the query string and an optional settings object, including `variables`.

```ts
import {ActionFunctionArgs} from '@remix-run/node';
import {authenticate} from '../shopify.server';

export async function action({request}: ActionFunctionArgs) {
  const {admin} = await authenticate.webhook(request);

  const response = await admin?.graphql(
    `#graphql
    mutation populateProduct($input: ProductInput!) {
      productCreate(input: $input) {
        product {
          id
        }
      }
    }`,
    {variables: {input: {title: 'Product Name'}}},
  );

  const productData = await response.json();
  return json({data: productData.data});
}
```

</details>
