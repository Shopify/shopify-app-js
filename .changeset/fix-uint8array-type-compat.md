---
'@shopify/shopify-api': patch
---

Fix TypeScript type errors for consumers using ES2024+ lib targets

Widen `ArrayBuffer` parameter types to `ArrayBuffer | Uint8Array` in crypto
utilities and safe-compare, fixing TS2345 errors introduced by TypeScript 5.7's
generic `Uint8Array<ArrayBuffer>` type.
