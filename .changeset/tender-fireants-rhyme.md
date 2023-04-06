---
'@shopify/shopify-app-session-storage-mysql': patch
---

Use decodeURIComponent on password, user, database name fields prior to calling underlying MySQL connection. Fixes #163
