---
'@shopify/shopify-api': minor
'@shopify/shopify-app-remix': patch
'@shopify/shopify-app-react-router': patch
---

Add `webhookId` (`shopify-webhook-id`) as a required field on Events webhooks. This is the true idempotency key for webhook deliveries. Previously, only `eventId` was extracted for Events webhooks and was used as a fallback for `webhookId` in downstream packages. This is no longer true. Both fields now coexist and represent distinct values.
