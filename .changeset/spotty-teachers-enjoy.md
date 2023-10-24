---
'@shopify/shopify-app-remix': minor
---

Added v3_authenticatePublic feature flag to remove `authenticate.public(request)`.

Apps can opt in to the new future at any time, so this is not a breaking change until version 3.

  <details>
    <summary>See an example</summary>

Without the `v3_authenticatePublic` future flag the deprecated `authenticate.public(request)` is supported:

```ts
await authenticate.public.checkout(request);
await authenticate.public.appProxy(request);

// Deprecated.  Use authenticate.public.checkout(request) instead
await authenticate.public(request);
```

With the `v3_authenticatePublic` future flag enabled the deprecated `authenticate.public(request)` is not supported:

```ts
await authenticate.public.checkout(request);
await authenticate.public.appProxy(request);
```

  </details>
