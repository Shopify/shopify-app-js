---
'@shopify/shopify-app-session-storage-redis': patch
---

Add event handlers to redis client to prevent crashing on disconnect event. Fixes #129, #160 (Thanks to @davidhollenbeckx for linking to issue and solution.)
