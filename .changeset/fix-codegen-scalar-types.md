---
'@shopify/api-codegen-preset': patch
---

Fix custom GraphQL scalars generating as `any` in codegen output

Shopify API custom scalars (e.g. `DateTime`, `Money`, `URL`, `HTML`) now
correctly generate as `string` in codegen output instead of `any`. The `JSON`
scalar generates as `unknown`. This applies automatically to all current and
future Shopify API scalars without requiring manual configuration.

Fixes https://github.com/Shopify/shopify-app-js/issues/1154
