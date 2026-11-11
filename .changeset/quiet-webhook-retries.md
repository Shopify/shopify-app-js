---
'@shopify/shopify-app-react-router': patch
'@shopify/shopify-app-remix': patch
---

Fix `authenticate.webhook` returning a 500 for uninstalled shops when expiring offline access tokens are enabled. When Shopify rejects the stored refresh token as no longer active, the webhook now returns a context without a session, so `app/uninstalled` and compliance handlers can run. Temporary refresh errors still return a 500 so Shopify retries the delivery.
