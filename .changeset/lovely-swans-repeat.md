---
'@shopify/shopify-app-remix': minor
---

- Internally rearranged source files to create a better separation between backend and frontend code, so we can add frontend-specific exports in the future.
- A new export path `@shopify/shopify-app-remix/react` will now contain those frontend exports.
- Aliased and deprecated `import {boundary} from @shopify/shopify-app-remix` since that is not backend code. Use this instead:
  ```ts
  import {boundary} from @shopify/shopify-app-remix/react;
  ```
