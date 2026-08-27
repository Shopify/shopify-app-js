---
'@shopify/shopify-api': minor
---

Added `shopify.appEvents.log()` for sending App Events to Shopify from your server, and `shopify.auth.globalApiClientCredentials()` for minting the app-level Global API token it uses. Both authenticate with the `apiKey` and `apiSecretKey` already in your config; no shop session is required.

Failed request errors now include the `error` message that Shopify returns at the top level of a response body, alongside the existing `errors` detail.
