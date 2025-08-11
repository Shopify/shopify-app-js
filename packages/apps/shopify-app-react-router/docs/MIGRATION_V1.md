# Migrating from v0.1.0 to v1.0.0

To migrate from `shopify-app-remix` to `shopify-app-react-router`, please see the [migration guide](https://github.com/Shopify/shopify-app-template-react-router/wiki/Upgrading-from-Remix).

## Breaking Change: Removal of API version constants

### What Changed

The `LATEST_API_VERSION` and `RELEASE_CANDIDATE_API_VERSION` constants have been removed from the package. The `apiVersion` parameter is now **required** in the `shopifyApp` configuration.

### Migration Steps

#### Step 1: Update Your Imports

**Before:**

```typescript
import { LATEST_API_VERSION, shopifyApp } from "@shopify/shopify-app-react-router/server";
// or
import { RELEASE_CANDIDATE_API_VERSION, shopifyApp } from "@shopify/shopify-app-react-router/server";
```

**After:**

```typescript
import { ApiVersion, shopifyApp } from "@shopify/shopify-app-react-router/server";
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
});
```