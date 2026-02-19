# Migrating to v13

This document outlines the changes you need to make to your app to migrate from v12 to v13 of this package.

## Removed older API versions

Support for the following API versions has been removed:

| Enum value | String value |
|------------|-------------|
| `ApiVersion.October22` | `2022-10` |
| `ApiVersion.January23` | `2023-01` |
| `ApiVersion.April23` | `2023-04` |
| `ApiVersion.July23` | `2023-07` |
| `ApiVersion.October23` | `2023-10` |
| `ApiVersion.January24` | `2024-01` |
| `ApiVersion.April24` | `2024-04` |
| `ApiVersion.July24` | `2024-07` |

These versions are outside Shopify's [rolling API support window](https://shopify.dev/docs/api/usage/versioning).

### Remaining supported versions

| Enum value | String value |
|------------|-------------|
| `ApiVersion.October24` | `2024-10` |
| `ApiVersion.January25` | `2025-01` |
| `ApiVersion.April25` | `2025-04` |
| `ApiVersion.July25` | `2025-07` |
| `ApiVersion.October25` | `2025-10` |
| `ApiVersion.January26` | `2026-01` |
| `ApiVersion.April26` | `2026-04` |
| `ApiVersion.Unstable` | `unstable` |

### Updating your app configuration

If your app uses one of the removed versions, update to a supported version:

```ts
// Before
import {shopifyApi, ApiVersion} from '@shopify/shopify-api';
import {restResources} from '@shopify/shopify-api/rest/admin/2023-04';

const shopify = shopifyApi({
  // ...
  apiVersion: ApiVersion.April23,
  restResources,
});

// After
import {shopifyApi, ApiVersion} from '@shopify/shopify-api';
import {restResources} from '@shopify/shopify-api/rest/admin/2026-01';

const shopify = shopifyApi({
  // ...
  apiVersion: ApiVersion.January26,
  restResources,
});
```

### Updating REST resource imports

REST resource directories for the removed versions have been deleted. Update your import path to match your configured `apiVersion`:

```ts
// Before
import {restResources} from '@shopify/shopify-api/rest/admin/2023-04';

// After
import {restResources} from '@shopify/shopify-api/rest/admin/2026-01';
```

For more information on Shopify's API versioning, see the [Shopify API versioning documentation](https://shopify.dev/docs/api/usage/versioning).
