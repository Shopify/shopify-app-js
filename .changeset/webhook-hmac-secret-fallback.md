---
'@shopify/shopify-api': minor
---

Added an optional `apiSecretKeyFallback` config option. When set, it is used as a secondary secret when validating **inbound** HMAC signatures (webhooks, Flow, and fulfillment-service requests), so requests are not dropped during a client-secret rotation while Shopify is still signing with the previous secret. Outbound signing continues to use `apiSecretKey` only. When a request validates against the fallback secret, a `Warning`-level log is emitted so you can tell when the old secret is no longer in use and the fallback can be removed.
