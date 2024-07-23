---
'@shopify/shopify-app-remix': patch
---

Throw a 500 response instead of a redirect if we detect a redirect loop in /auth/login.
