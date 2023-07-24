---
'@shopify/shopify-app-remix': patch
---

authenticate.webhook now returns context when there is no session for the corresponding shop instead of throwing a 404 Response
