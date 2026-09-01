---
'@shopify/shopify-api': major
'@shopify/shopify-app-react-router': major
'@shopify/shopify-app-remix': major
---

Remove `eventId` and `resourceId` from events webhooks

Shopify is dropping the `shopify-event-id` and `shopify-resource-id` headers from events deliveries, so the libraries no longer read them. Both fields are gone from the public types, which makes this a breaking change.

Webhooks are unaffected. They keep the `X-Shopify-Event-Id` header and the `eventId` field.

## Migration Guide

Stop reading `eventId` and `resourceId` on events deliveries. Neither field has a direct equivalent: `eventId` identified the event behind a delivery, and `resourceId` carried the root resource's GID, which you can read from the payload instead.

To deduplicate events deliveries, use `webhookId`. It comes from the `shopify-webhook-id` header, which Shopify still sends, and it is unique per delivery.

### For @shopify/shopify-app-remix and @shopify/shopify-app-react-router

**Before:**

```typescript
export const action = async ({request}: ActionFunctionArgs) => {
  const {webhookType, eventId, resourceId} =
    await authenticate.webhook(request);

  if (webhookType === 'events') {
    console.log(`Event ${eventId} for resource ${resourceId}`);
  }

  return new Response();
};
```

**After:**

```typescript
export const action = async ({request}: ActionFunctionArgs) => {
  const {webhookType, payload} = await authenticate.webhook(request);

  if (webhookType === 'events') {
    // eventId and resourceId are no longer set on events deliveries.
    // The root resource's GID is in the payload.
    console.log(payload);
  }

  return new Response();
};
```
