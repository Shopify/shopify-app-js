---
'@shopify/shopify-app-session-storage-mysql': patch
---

In 1.0.2 of MySQLSessionStorage, the constructor could accept either a URL object or a URL string. The string option was accidentally removed, starting 1.1.0. This patch adds it back in. Fixes #204
