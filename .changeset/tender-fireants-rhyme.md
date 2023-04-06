---
'@shopify/shopify-app-session-storage-mysql': patch
'@shopify/shopify-app-session-storage-postgresql': patch
---

Use decodeURIComponent on password, user, database name fields prior to calling underlying MySQL connection. Fixes #163. Also applied to postgresql adapter.
