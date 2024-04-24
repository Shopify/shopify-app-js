---
"@shopify/shopify-api": major
---

Changed the package's build process to produce both ESM and CJS outputs.

While this should have no effect on most apps, if you're directly importing a file from the package, its path will have changed.
Regular imports for package files remain unchanged.

Before:

```ts
import 'node_modules/@shopify/shopify-api/lib/clients/admin/graphql/client'
import '@shopify/shopify-api/adapters/node'
```

After:

```ts
// Add `dist/esm|cjs/` before the file
import 'node_modules/@shopify/shopify-api/dist/esm/lib/clients/admin/graphql/client'
// Unchanged
import '@shopify/shopify-api/adapters/node'
```

