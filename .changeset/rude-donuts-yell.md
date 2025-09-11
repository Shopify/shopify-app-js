---
'@shopify/shopify-app-remix': major
---

The `LATEST_API_VERSION` and `RELEASE_CANDIDATE_API_VERSION` constants have been removed from the package. The `apiVersion` parameter is now **required** in the `shopifyApp` configuration.

We are making this change to ensure the API versions do not change without the developer explicitly opting into the new version. This removes the potential for apps to break unexpectedly and should reduce overall maintenance.

### Migration Steps

#### Step 1: Update Your Imports

**Before:**

```typescript
import { LATEST_API_VERSION, shopifyApp } from "@shopify/shopify-app-remix/server";
// or
import { RELEASE_CANDIDATE_API_VERSION, shopifyApp } from "@shopify/shopify-app-remix/server";
```

**After:**

```typescript
import { ApiVersion, shopifyApp } from "@shopify/shopify-app-remix/server";
```

#### Step 2: Update Your Configuration

**Before:**

```typescript
const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  scopes: process.env.SCOPES?.split(",")!,
  appUrl: process.env.SHOPIFY_APP_URL!,
  apiVersion: LATEST_API_VERSION, // or omitted entirely
});
```

**After:**

```typescript
const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  scopes: process.env.SCOPES?.split(",")!,
  appUrl: process.env.SHOPIFY_APP_URL!,
  apiVersion: ApiVersion.July25, // Now required - choose your desired version
})
