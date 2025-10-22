---
'@shopify/api-codegen-preset': patch
---

Fixed TypeScript module resolution error by including file extensions (.d.ts or .ts) in generated import paths to support Node16/NodeNext module resolution strategies.
