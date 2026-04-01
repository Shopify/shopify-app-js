---
name: adding-api-versions
description: Use when adding a new API version to the shopify-api package, creating REST resource files for a new version, updating API version constants, or handling breaking changes like removed or modified resources between versions.
---

# Adding a New API Version

Step-by-step process for adding a new API version to `packages/apps/shopify-api`. Uses 2026-04 as a reference example.

## Prerequisites

- Know which resources are removed or modified in the new version

## Step 1: Update API Version Constants

Edit `packages/apps/shopify-api/lib/types.ts`:

```typescript
export enum ApiVersion {
  // ... existing versions ...
  January26 = '2026-01',
  April26 = '2026-04',      // New version
  July26 = '2026-07',       // Release candidate (next version)
}
```

**Naming convention:** `{Month}{YY}` (e.g., `April26`, `July26`). Value format: `YYYY-MM`.

Also add the **next** quarterly version as a release candidate enum value (no REST resources needed yet).

## Step 2: Create Directory Structure

```bash
mkdir packages/apps/shopify-api/rest/admin/{YYYY-MM}/
mkdir packages/apps/shopify-api/rest/admin/__tests__/{YYYY-MM}/
```

## Step 3: Copy and Update Resource Files

Copy from the most recent version:

```bash
cp -r packages/apps/shopify-api/rest/admin/{PREVIOUS_VERSION}/* \
      packages/apps/shopify-api/rest/admin/{NEW_VERSION}/

cp -r packages/apps/shopify-api/rest/admin/__tests__/{PREVIOUS_VERSION}/* \
      packages/apps/shopify-api/rest/admin/__tests__/{NEW_VERSION}/
```

In every resource file, update the `apiVersion` property:

```typescript
// From
public static apiVersion = ApiVersion.January26;
// To
public static apiVersion = ApiVersion.April26;
```

## Step 4: Update Test Files

Two changes in every test file:

1. **testConfig calls:**
   ```typescript
   testConfig({apiVersion: ApiVersion.April26, restResources})
   ```

2. **URL paths in expectations:**
   ```typescript
   `https://test-shop.myshopify.io/admin/api/2026-04/...`
   ```

## Step 5: Update Index File

Edit `packages/apps/shopify-api/rest/admin/{NEW_VERSION}/index.ts`:

- Import all resources (except removed ones)
- Update `RestResources` interface
- Update `restResources` export

For removed resources, delete their imports and exports:
```typescript
// Remove from interface and export
export interface RestResources extends ShopifyRestResources {
  // CustomerAddress: typeof CustomerAddress;  // Removed in 2025-07
}
```

## Step 6: Handle Breaking Changes

For **removed resources** (e.g., CustomerAddress in 2025-07):
1. Delete the resource file from `rest/admin/{NEW_VERSION}/`
2. Delete the test file from `rest/admin/__tests__/{NEW_VERSION}/`
3. Remove imports/exports from `index.ts`

For **modified resources**:
1. Update class properties
2. Modify `paths` array if endpoints changed
3. Update method signatures if parameters changed
4. Adjust tests accordingly

## Step 7: Run Tests and Build

```bash
# Test the new version
pnpm test -- packages/apps/shopify-api/rest/admin/__tests__/{NEW_VERSION}

# Run all tests
pnpm test
```

## Checklist

- [ ] New enum value in `ApiVersion` (`packages/apps/shopify-api/lib/types.ts`)
- [ ] Next quarterly release candidate enum value added (no REST resources needed)
- [ ] Source directory created: `rest/admin/{NEW_VERSION}/`
- [ ] Test directory created: `rest/admin/__tests__/{NEW_VERSION}/`
- [ ] All resource files copied and `apiVersion` updated
- [ ] All test files updated (testConfig + URL paths)
- [ ] `index.ts` updated with correct imports/exports
- [ ] Removed resources and their tests deleted
- [ ] Modified resources updated
- [ ] All tests pass
- [ ] Package builds without errors
