---
'@shopify/shopify-app-session-storage-dynamodb': patch
---

Add support for storing refresh tokens and refresh token expiration dates. This enables apps using expiring offline access tokens to store and refresh tokens automatically.

## Changes

- Configure DynamoDB marshalling to handle Date objects (required for `refreshTokenExpires` field)
- Enable refresh token tests in batteryOfTests suite

## Technical Details

Updated the AWS SDK `marshall` configuration to include `convertClassInstanceToMap: true`, which allows proper serialization of Date objects like `refreshTokenExpires`. Without this option, the SDK cannot serialize JavaScript Date instances to DynamoDB attributes.

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
