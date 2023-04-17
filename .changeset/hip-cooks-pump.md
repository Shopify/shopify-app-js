---
'@shopify/shopify-app-session-storage': patch
'@shopify/shopify-app-session-storage-kv': patch
'@shopify/shopify-app-session-storage-memory': patch
'@shopify/shopify-app-session-storage-mongodb': patch
'@shopify/shopify-app-session-storage-mysql': patch
'@shopify/shopify-app-session-storage-postgresql': patch
'@shopify/shopify-app-session-storage-redis': patch
'@shopify/shopify-app-session-storage-sqlite': patch
'@shopify/shopify-app-session-storage-test-utils': patch
---

Add @shopify/shopify-api as a peerDependencies entry for each session-storage package, to avoid API library conflicts (e.g., scopesArray.map error). Should help avoid issues like #93
