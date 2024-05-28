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
