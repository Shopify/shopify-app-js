---
'@shopify/shopify-app-remix': major
'@shopify/shopify-app-express': major
'@shopify/shopify-app-session-storage': major
'@shopify/shopify-app-session-storage-dynamodb': major
'@shopify/shopify-app-session-storage-kv': major
'@shopify/shopify-app-session-storage-memory': major
'@shopify/shopify-app-session-storage-mongodb': major
'@shopify/shopify-app-session-storage-mysql': major
'@shopify/shopify-app-session-storage-postgresql': major
'@shopify/shopify-app-session-storage-prisma': major
'@shopify/shopify-app-session-storage-redis': major
'@shopify/shopify-app-session-storage-sqlite': major
---

### Removed support for Node 14

Node 14 has reached it's [EOL](https://endoflife.date/nodejs), and dependencies to this package no longer work on Node 14.
Because of that, we can no longer support that version.

If your app is running on Node 14, you'll need to update to a more recent version before upgrading this package.

This upgrade does not require any code changes.
