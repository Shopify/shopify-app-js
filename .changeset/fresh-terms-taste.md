---
'@shopify/shopify-app-remix': major
---

Refactored to set tokenExchange as default strategy for embedded apps to retrieve access tokenn by replacing unstable_newEmbeddedAuthStrategy with disableTokenExchange.

WHAT: Removed `unstable_newEmbeddedAuthStrategy` flag and replaced it with `disableTokenExchange` flag in the app configuration.

WHY: Token exchange is now the default authentication strategy for embedded apps. The `unstable_newEmbeddedAuthStrategy` flag was used to opt-in to this behavior, but now that it's stable and the default, we've replaced it with an opt-out flag.

HOW: If you were using `unstable_newEmbeddedAuthStrategy: true`, you can remove it as this is now the default behavior. If you need to use the legacy authorization code grant flow, set `disableTokenExchange: true` in your app configuration.
