---
"@shopify/graphql-client": patch
"@shopify/storefront-api-client": patch
---

Fixed the minified build process to not mangle the `fetch` function, which led to requests failing in the final package.
