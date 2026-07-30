---
'@shopify/shopify-app-express': minor
---

Add token exchange authentication support for embedded apps, behind the `unstable_tokenExchange` future flag. When enabled, embedded apps fetch access tokens via token exchange (no OAuth redirect flicker) instead of the auth code flow. Non-embedded apps, and apps with the flag off, continue to use the OAuth code flow.

Also adds a `hooks.afterAuth` config option and a `shopify.registerWebhooks({session})` helper for registering webhooks outside the OAuth callback.

This builds on the original work by @mrmarufpro in #3097. Thank you for contributing this.
