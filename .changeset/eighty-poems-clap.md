---
'@shopify/shopify-api': minor
'@shopify/shopify-app-react-router': minor
'@shopify/shopify-app-remix': minor
---

Stop reading the `shopify-event-id` and `shopify-resource-id` headers on events webhooks

Shopify is dropping these two headers from events deliveries, so the libraries no longer read them.

**`@shopify/shopify-api`:** `shopify-event-id` was a required header, so `shopify.webhooks.validate()` no longer fails with `MissingHeaders` when it is absent. `eventId` and `resourceId` are gone from the events validation result — use `webhookId` as the idempotency key.

```typescript
const check = await shopify.webhooks.validate({rawBody, rawRequest: request});
if (check.valid && check.webhookType === 'events') {
  console.log(check.webhookId); // use this to deduplicate
}
```

**`@shopify/shopify-app-react-router` and `@shopify/shopify-app-remix`:** `resourceId` is gone from the webhook context, and `eventId` is now set only for webhooks, not events webhooks.

If you read `eventId` or `resourceId` off an events delivery in TypeScript, you will see a compile error. Both are on their way to being `undefined` at runtime regardless, because Shopify is no longer sending the headers.

Webhooks are unaffected. They keep the `X-Shopify-Event-Id` header and the `eventId` field.
