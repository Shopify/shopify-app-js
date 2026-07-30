---
'@shopify/shopify-app-remix': patch
'@shopify/shopify-app-react-router': patch
---

Fix 'Authenticating admin request' info log always showing null for shop. The shop is now logged after it is extracted from the session token context, so it reflects the actual shop value instead of null.
