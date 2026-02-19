---
'@shopify/shopify-app-session-storage-dynamodb': patch
---

Fix refresh token storage by properly serializing Date objects to ISO strings.

Previously, DynamoDB storage would fail when attempting to store sessions with `refreshTokenExpires` because DynamoDB cannot natively store JavaScript Date objects. This change explicitly converts `refreshTokenExpires` to an ISO string during serialization and back to a Date during deserialization, matching the existing pattern for the `expires` field.

## Changes

- Add explicit `refreshTokenExpires` Date serialization to ISO string
- Add explicit `refreshTokenExpires` deserialization from ISO string to Date
- Enable refresh token tests in batteryOfTests suite

## Using Refresh Tokens

To enable expiring offline access tokens:

```typescript
import {shopifyApp} from '@shopify/shopify-app-react-router/server';
import {DynamoDBSessionStorage} from '@shopify/shopify-app-session-storage-dynamodb';

const shopify = shopifyApp({
  future: {
    expiringOfflineAccessTokens: true,
  },
  sessionStorage: new DynamoDBSessionStorage(),
  // ... other config
});
```

**Note**: No migration required. DynamoDB's flexible schema automatically handles the new optional fields. Existing sessions without refresh tokens continue to work.
