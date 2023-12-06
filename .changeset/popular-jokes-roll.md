---
'@shopify/shopify-app-remix': patch
---

Now `authenticate.webhook(request);` will return 401 Unauthorized when webhook HMAC validation fails.
