---
'@shopify/shopify-api': major
'@shopify/shopify-app-react-router': minor
'@shopify/shopify-app-remix': minor
---

Add support for verifying webhooks delivered with the new `shopify-*` headers (replacing the previous `x-shopify-*` headers), and refactor webhook validation types to a discriminated union on `webhookType`.

**Breaking change in `@shopify/shopify-api`:** `WebhookFields` is now a discriminated union (`WebhooksWebhookFields | EventsWebhookFields`) keyed on the required `webhookType` field. `webhookId` only exists on `WebhooksWebhookFields`; `eventId` is required on `EventsWebhookFields`. Consumers must narrow on `webhookType` to access type-specific fields. Both `WebhooksWebhookFields` and `EventsWebhookFields` are exported for use in type narrowing.

Before:

```typescript
const check = await shopify.webhooks.validate({rawBody, rawRequest: request});
if (check.valid) {
  console.log(check.webhookId);
}
```

After:

```typescript
const check = await shopify.webhooks.validate({rawBody, rawRequest: request});
if (check.valid) {
  if (check.webhookType === 'webhooks') {
    console.log(check.webhookId); // only on webhooks
    console.log(check.subTopic);  // only on webhooks
  } else {
    console.log(check.eventId);    // only on events
    console.log(check.handle);     // only on events
    console.log(check.action);     // only on events
    console.log(check.resourceId); // only on events
  }
}
```

**`@shopify/shopify-app-react-router` and `@shopify/shopify-app-remix`:** The webhook context now includes new fields based on the new webhook headers, such as `webhookType`, `handle`, `action`, `resourceId`, `triggeredAt`, and `eventId`. For events webhooks, `webhookId` is set to the value of the `eventId` header for backwards compatibility — prefer using `eventId` directly for events webhooks, as `webhookId` will be removed from events webhooks in the next major version.

```typescript
export const action = async ({request}: ActionFunctionArgs) => {
  const {webhookType, handle, action, resourceId, triggeredAt, eventId} =
    await authenticate.webhook(request);
  return new Response();
};
```
