---
'@shopify/shopify-api': major
'@shopify/shopify-app-remix': major
'@shopify/shopify-app-react-router': major
---

Removed deprecated `subTopic` from webhooks. The subTopic feature was deprecated in API version 2024-04 and fully removed in 2024-07.

## Migration Guide

The `subTopic` feature was deprecated in API version 2024-04 and fully removed in 2024-07. Use [webhook filters](https://shopify.dev/docs/apps/build/webhooks/customize/filters) instead.

### For @shopify/shopify-api

**Webhook Handlers** - Remove the `subTopic` parameter:

**Before:**
```typescript
async function handler(
  topic: string,
  shop: string,
  body: string,
  webhookId: string,
  apiVersion: string,
  subTopic: string,
) {
  console.log(`SubTopic: ${subTopic}`);
  // handler logic
}
```

**After:**
```typescript
async function handler(
  topic: string,
  shop: string,
  body: string,
  webhookId: string,
  apiVersion: string,
) {
  // subTopic is no longer available
  // Use filters when registering webhooks instead
  // handler logic
}
```

**Webhook Registration** - Replace `subTopic` with `filter`:

**Before:**
```typescript
shopify.webhooks.addHandlers({
  METAOBJECTS_CREATE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: '/webhooks',
    subTopic: 'type:my-metaobject-type',
  },
});
```

**After:**
```typescript
// For metaobjects webhooks, filters are now REQUIRED
shopify.webhooks.addHandlers({
  METAOBJECTS_CREATE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: '/webhooks',
    // Use includeFields to specify filter fields
    includeFields: ['type'],
  },
});

// Then apply filters via GraphQL Admin API or app configuration:
// filter: "type:my-metaobject-type"
// Multiple types: "type:banana OR type:apple"
```

### For @shopify/shopify-app-remix and @shopify/shopify-app-react-router

Remove `subTopic` from webhook context:

**Before:**
```typescript
export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, subTopic, payload } = await authenticate.webhook(request);
  console.log(`SubTopic: ${subTopic}`);
  return new Response();
};
```

**After:**
```typescript
export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, payload } = await authenticate.webhook(request);
  // Use the payload data to determine specifics
  // For metaobjects: payload.type contains the metaobject type
  return new Response();
};
```

### Important Notes

- **Metaobjects webhooks** (`metaobjects/create`, `metaobjects/update`, `metaobjects/delete`) now **require filters**
- Use `filter: "type:{type}"` format where `{type}` is the metaobject definition's type
- Wildcard filters like `type:*` are not supported - explicitly specify each type
- For app-owned metaobject definitions, use the full type value: `app--{your-app-id}--{some-namespace}`

Learn more: [Webhook filters documentation](https://shopify.dev/docs/apps/build/webhooks/customize/filters)
