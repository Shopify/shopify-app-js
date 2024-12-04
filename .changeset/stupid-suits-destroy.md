---
'@shopify/shopify-app-remix': minor
---

Remove `wip_optionalScopesApi` future flag and enable [the Remix Scopes API](https://shopify.dev/docs/api/shopify-app-remix/v3/apis/scopes) by default.

Example of checking for a granted scope on a shop with `scopes.query()`:

```ts
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { scopes } = await authenticate.admin(request);

  const scopesDetail =  await scopes.query();

  return json({
    hasWriteProducts: scopesDetail.granted.includes('write_products'),
  });
};

export default function Index() {
  const {hasWriteProducts} = useLoaderData<typeof loader>();

  ...
}
```

See the [Remix Scopes API documentation](https://shopify.dev/docs/api/shopify-app-remix/v3/apis/scopes) for more details on this API, and the [Manage Access Scopes page](https://shopify.dev/docs/apps/build/authentication-authorization/app-installation/manage-access-scopes) on shopify.dev for more context how the Scopes APIs can be used to manage access scopes from one shop to another.
