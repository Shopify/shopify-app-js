---
'@shopify/shopify-app-remix': minor
---

Added support for `future` flags in the `shopifyApp` function, with a `v3_webhookContext` flag to have `authenticate.webhook` return a standard `admin` context, instead of a different type.

Apps can opt in to the new future at any time, so this is not a breaking change (yet).
