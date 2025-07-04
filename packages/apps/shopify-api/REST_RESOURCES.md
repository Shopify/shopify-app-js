# Adding a New API Version to Shopify API JS

## Overview
This guide provides step-by-step instructions for adding a new API version to the Shopify API JS library. This example uses the addition of the 2025-07 API version as a reference, but the process applies to any new API version.

## Prerequisites
- Understanding of any breaking changes or removed resources in the new API version

## Step 1: Update API Version Constants

### Add New Version Enum Value
Edit `packages/apps/shopify-api/lib/types.ts` to add your new version:

```typescript
// Add the new enum value following the naming pattern
export enum ApiVersion {
  // ... existing versions ...
  April25 = '2025-04',
  July25 = '2025-07',      // Your new version
  October25 = '2025-10',   // If adding a future RC version
}

// If this is the latest stable version, update LATEST_API_VERSION
export const LATEST_API_VERSION = ApiVersion.July25;  // Update from previous

// If adding a new RC version, update RELEASE_CANDIDATE_API_VERSION
export const RELEASE_CANDIDATE_API_VERSION = ApiVersion.October25;  // Update from previous
```

**Naming Convention:**
- Format: `{Month}{YY}`
- Examples: `April25`, `July25`, `October25`
- Value format: `YYYY-MM`

## Step 2: Create Directory Structure

### Create Source Directory
```bash
mkdir packages/apps/shopify-api/rest/admin/{YYYY-MM}/
```
Example: `packages/apps/shopify-api/rest/admin/2025-07/`

### Create Test Directory
```bash
mkdir packages/apps/shopify-api/rest/admin/__tests__/{YYYY-MM}/
```
Example: `packages/apps/shopify-api/rest/admin/__tests__/2025-07/`

## Step 3: Copy and Update Resource Files

### Copy Previous Version's Files
Copy all files from the most recent API version directory:

```bash
# Copy source files
cp -r packages/apps/shopify-api/rest/admin/{PREVIOUS_VERSION}/* \
      packages/apps/shopify-api/rest/admin/{NEW_VERSION}/

# Copy test files  
cp -r packages/apps/shopify-api/rest/admin/__tests__/{PREVIOUS_VERSION}/* \
      packages/apps/shopify-api/rest/admin/__tests__/{NEW_VERSION}/
```

### Update Each Resource File
For each TypeScript file in the new directory, update:

1. **API Version Property**
   ```typescript
   // From
   public static apiVersion = ApiVersion.April25;
   
   // To
   public static apiVersion = ApiVersion.July25;
   ```

### Example Resource File Update

**Before (2025-04/article.ts)**:
```typescript
/***********************************************************************************************************************
* This file is auto-generated. If you have an issue, please create a GitHub issue.                                     *
***********************************************************************************************************************/

import {Base, FindAllResponse} from '../../base';
import {ResourcePath, ResourceNames} from '../../types';
import {Session} from '../../../lib/session/session';
import {ApiVersion} from '../../../lib/types';

// ... interface definitions ...

export class Article extends Base {
  public static apiVersion = ApiVersion.April25;
  // ... rest of the file is identical
}
```

**After (2025-07/article.ts)**:
```typescript
/***********************************************************************************************************************
* This file is auto-generated. If you have an issue, please create a GitHub issue.                                     *
***********************************************************************************************************************/

import {Base, FindAllResponse} from '../../base';
import {ResourcePath, ResourceNames} from '../../types';
import {Session} from '../../../lib/session/session';
import {ApiVersion} from '../../../lib/types';

// ... interface definitions ...

export class Article extends Base {
  public static apiVersion = ApiVersion.July25;
  // ... rest of the file is identical
}
```

## Step 4: Update Test Files

### Test File Naming
Test files follow the pattern: `{resource_name}.test.ts`
Example: `article.test.ts`, `customer.test.ts`

### Update Test File Contents
For each test file, update all instances of the API version:

1. **Test Config API Version**
   ```typescript
   // From
   testConfig({apiVersion: ApiVersion.April25, restResources}),
   
   // To
   testConfig({apiVersion: ApiVersion.July25, restResources}),
   ```

2. **URL Paths in Expectations**
   ```typescript
   // From
   `https://test-shop.myshopify.com/admin/api/2025-04/...`
   
   // To
   `https://test-shop.myshopify.com/admin/api/2025-07/...`
   ```

### Example Test File Update
```typescript
// Update all testConfig calls
const session = new Session({
  id: '1234',
  shop: domain,
  state: '1234',
  isOnline: true,
});

it('test: article find', async () => {
  const shopify = shopifyApi(
    testConfig({apiVersion: ApiVersion.July25, restResources}),  // Updated
  );
  // ... rest of test
});
```

## Step 5: Update Index File

### Update the Index Export File
Edit `packages/apps/shopify-api/rest/admin/{NEW_VERSION}/index.ts`:

1. **Import All Resources** (except removed ones)
2. **Update RestResources Interface**
3. **Update restResources Export**

If resources were removed, remove their imports and exports:
```typescript
// Remove import if resource was deprecated
// import {CustomerAddress} from './customer_address';

// Remove from interface
export interface RestResources extends ShopifyRestResources {
  // ... other resources ...
  // CustomerAddress: typeof CustomerAddress;  // Removed
}

// Remove from export
export const restResources: RestResources = {
  // ... other resources ...
  // CustomerAddress,  // Removed
};
```

## Step 6: Handle Breaking Changes

### Identify Removed or Modified Resources
Identify the following:
- Removed resources (e.g., CustomerAddress in 2025-07)
- Modified endpoints
- Changed field names or types

### Remove Deprecated Resources
If a resource is removed in the new API version:
1. Delete the resource file from `packages/apps/shopify-api/rest/admin/{NEW_VERSION}/`
2. Delete the corresponding test file from `packages/apps/shopify-api/rest/admin/__tests__/{NEW_VERSION}/`
3. Remove all imports and references from `index.ts`

### Update Modified Resources
If a resource has changed:
1. Update the class properties
2. Modify the `paths` array if endpoints changed
3. Update method signatures if parameters changed
4. Adjust test cases accordingly

## Step 7: Run Tests and Build

### Run Tests
```bash
# Run tests for the new API version
npm test -- packages/apps/shopify-api/rest/admin/__tests__/{NEW_VERSION}

# Run all tests to ensure nothing broke
npm test
```

## Checklist

- [ ] Added new enum value to `ApiVersion` in `packages/apps/shopify-api/lib/types.ts`
- [ ] Updated `LATEST_API_VERSION` constant if applicable
- [ ] Updated `RELEASE_CANDIDATE_API_VERSION` if adding RC version
- [ ] Created `packages/apps/shopify-api/rest/admin/{NEW_VERSION}/` directory
- [ ] Created `packages/apps/shopify-api/rest/admin/__tests__/{NEW_VERSION}/` directory
- [ ] Copied all resource files from previous version
- [ ] Updated `apiVersion` property in all resource files
- [ ] Updated all test files with new API version in testConfig
- [ ] Updated all API URLs in test expectations
- [ ] Updated `index.ts` with correct imports/exports
- [ ] Removed deprecated resources and their tests
- [ ] Updated modified resources
- [ ] All tests pass successfully
- [ ] Package builds without errors