---
'@shopify/shopify-app-remix': minor
---

- Internally rearranged source files to create a better separation between backend and frontend code, so we can add frontend-specific exports.
- A new export path `@shopify/shopify-app-remix/react` will now contain those frontend exports.
- The existing server code will be moved to `@shopify/shopify-app-remix/server`, but the root import will still work until the next major release in the future.
