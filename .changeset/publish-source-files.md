---
'@shopify/admin-api-client': patch
'@shopify/api-codegen-preset': patch
'@shopify/graphql-client': patch
'@shopify/storefront-api-client': patch
'@shopify/shopify-api': patch
'@shopify/shopify-app-express': patch
'@shopify/shopify-app-remix': patch
'@shopify/shopify-app-react-router': patch
'@shopify/shopify-app-session-storage': patch
'@shopify/shopify-app-session-storage-test-utils': patch
'@shopify/shopify-app-session-storage-drizzle': patch
'@shopify/shopify-app-session-storage-dynamodb': patch
'@shopify/shopify-app-session-storage-kv': patch
'@shopify/shopify-app-session-storage-memory': patch
'@shopify/shopify-app-session-storage-mongodb': patch
'@shopify/shopify-app-session-storage-mysql': patch
'@shopify/shopify-app-session-storage-postgresql': patch
'@shopify/shopify-app-session-storage-prisma': patch
'@shopify/shopify-app-session-storage-redis': patch
'@shopify/shopify-app-session-storage-sqlite': patch
---

Publish TypeScript source files to npm so "Go to Definition" in IDEs navigates to real source code instead of compiled `.d.ts` declaration files. Source maps already pointed to the correct paths — the source files just weren't included in the published packages.
