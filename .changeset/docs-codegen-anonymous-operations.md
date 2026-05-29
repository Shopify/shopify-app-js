---
'@shopify/api-codegen-preset': patch
---

Document that anonymous GraphQL operations are silently ignored during type
generation. Only named queries and mutations produce types; a project
containing only anonymous operations generates an empty `*.generated.d.ts`
without an error. (README-only change.)
