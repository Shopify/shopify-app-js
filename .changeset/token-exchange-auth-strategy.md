---
'@shopify/shopify-app-express': minor
---

Add token exchange authentication strategy and hooks support

- Add `future` config option with feature flags (`unstable_newEmbeddedAuthStrategy`, `expiringOfflineAccessTokens`) to opt into upcoming behaviour changes
- Add `unstable_newEmbeddedAuthStrategy` flag: when enabled, `validateAuthenticatedSession` exchanges session tokens directly instead of redirecting to OAuth, and `ensureInstalledOnShop` skips the session check for embedded apps
- Add `hooks.afterAuth` async callback invoked after both OAuth and token exchange flows (deduplicated across concurrent requests)
- Add `registerWebhooks({session})` convenience method on the `ShopifyApp` object
- Add `expiringOfflineAccessTokens` flag to enable expiring offline access tokens in OAuth and token exchange flows
- Add `ensureOfflineTokenIsNotExpired` helper to proactively refresh offline tokens nearing expiry
