---
'@shopify/shopify-app-remix': patch
---

Deliver webhooks without a session instead of responding with a 500 when refreshing an expired offline access token fails. With the `expiringOfflineAccessTokens` future flag enabled, the stored offline token is typically expired by the time `APP_UNINSTALLED` or the mandatory GDPR webhooks arrive, and Shopify rejects the refresh attempt because the app is no longer installed — so `authenticate.webhook` threw a 500 and Shopify kept retrying the delivery indefinitely.
