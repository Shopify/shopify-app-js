---
'@shopify/shopify-api': minor
---

Add TriggeredAt and EventId headers to Shopify webhook. Previously these were missing

https://shopify.dev/docs/apps/build/webhooks#key-terminology
```ts

enum ShopifyHeader {
  ...,
  TriggeredAt = 'X-Shopify-Triggered-At', // added
  EventId = 'X-Shopify-Event-Id', // added
}
```
