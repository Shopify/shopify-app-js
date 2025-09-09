---
'@shopify/shopify-app-express': major
---

The `LATEST_API_VERSION` and `RELEASE_CANDIDATE_API_VERSION` constants have been removed from the package. The `apiVersion` parameter is now **required** in the `shopifyApp` configuration.

We are making this change to ensure the API versions do not change without the developer explicitly opting into the new version. This removes the potential for apps to break unexpectedly and should reduce overall maintenance.

### Migration Steps


**Before:**

```typescript
import { shopifyApp } from "@shopify/shopify-app-express";
import { LATEST_API_VERSION } from "@shopify/shopify-api";

const shopify = shopifyApp({
  api: {
    apiVersion: LATEST_API_VERSION,
    // ...
  }
  // ...
});
```

**After:**

```typescript
import { shopifyApp } from "@shopify/shopify-app-express";
import { ApiVersion } from "@shopify/shopify-api";

const shopify = shopifyApp({
  api: {
    apiVersion: ApiVersion.July25,
    // ...
  }
  // ...
});
```
