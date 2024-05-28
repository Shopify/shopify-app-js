# Migrating to Version 3.0.0

## Replace `authenticate.public()` with `authenticate.public.checkout()`

The `v3_authenticatePublic` future flag has been enabled, and removed.

The `authenticate.public` export used to be a function that was meant to authenticate [checkout extension](https://shopify.dev/docs/api/checkout-extensions) requests.

That was confusing, because:

- It isn't the only type of public requests apps might need to handle
- It didn't make it clear what the purpose of the export was

We refactored the export so that all public authentication methods are grouped together under `authenticate.public`, for instance `authenticate.public.checkout()` and `authenticate.public.appProxy()`.

Before:

```ts
export async function loader({request}: LoaderFunctionArgs) {
  await authenticate.public(request);

  return null;
}
```

After:

```ts
export async function loader({request}: LoaderFunctionArgs) {
  await authenticate.public.checkout(request);

  return null;
}
```

## Align the `admin` context object for webhooks

The `v3_webhookAdminContext` future flag has been removed and the feature has been enabled.

The `admin` context returned by `authenticate.webhook` didn't match the object returned by e.g. `authenticate.admin`, which could lead to confusion.

We updated the shape of the object returned by `authenticate.webhook` so that every authentication method returns a consistent format.
That reduces the mental load for developers as they shouldn't have to learn more than one way of doing the same thing.

To update your code:

- GraphQL:
  - replace `admin?.graphql.query()` with `admin?.graphql()`
  - the graphql query function now takes the query string as the first argument, and an optional settings object, as opposed to a single object
- REST:
  - `admin.rest.get|post|put|delete()` remain unchanged
  - `admin.rest.Product` (or other resource classes) are now under `admin.rest.resources.Product`

Before:

```ts
export async function action({request}: ActionFunctionArgs) {
  const {admin} = await shopify.authenticate.webhook(request);

  // GraphQL query
  const response = await admin?.graphql.query<any>({
    data: {
      query: `query { ... }`,
      variables: {myVariable: '...'},
    },
  });

  // REST resource
  const products = await admin?.rest.Product.all({
    // ...
  });

  // ...
}
```

After:

```ts
export async function action({request}: ActionFunctionArgs) {
  const {admin} = await shopify.authenticate.webhook(request);

  // GraphQL query
  const response = await admin?.graphql(`query { ... }`, {
    variables: {myVariable: '...'},
  });
  const data = await response.json();

  // REST resource
  const products = await admin?.rest.resources.Product.all({
    // ...
  });

  // ...
}
```
