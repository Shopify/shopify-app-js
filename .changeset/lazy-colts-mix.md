---
'@shopify/shopify-api': major
---

he `LATEST_API_VERSION` and `RELEASE_CANDIDATE_API_VERSION` constants have been removed from the package. The `apiVersion` parameter is now **required** in the `shopifyApp` configuration.

We are making this change to ensure the API versions do not change without the developer explicitly opting into the new version. This removes the potential for apps to break unexpectedly and should reduce overall maintenance.

### Migration Steps


**Before:**

```typescript
import { shopifyApi, LATEST_API_VERSION } from "@shopify/shopify-api";

const shopify = shopifyApi({
  apiVersion: LATEST_API_VERSION,
  // ...
});
```

**After:**

```typescript
import { shopifyApi, ApiVersion } from "@shopify/shopify-api";

const shopify = shopifyApi({
  apiVersion: ApiVersion.July25,
  // ...  
});
```
