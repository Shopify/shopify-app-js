---
'@shopify/api-codegen-preset': patch
---

Fixed TypeScript compilation error (ts5097) for users without `allowImportingTsExtensions` by using `.js` extensions for generated import paths. The `.js` extension works across all TypeScript module resolution strategies.
