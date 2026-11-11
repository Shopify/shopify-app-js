---
'@shopify/shopify-app-react-router': patch
'@shopify/shopify-app-remix': patch
---

Fix `authenticate.webhook` returning a 500 for uninstalled shops when expiring offline access tokens are enabled. If the refresh token is no longer active, the webhook now gets a context without a session, so `app/uninstalled` and compliance handlers can run.
