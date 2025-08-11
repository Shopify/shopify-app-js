# Refactor Plan: Remove LATEST_API_VERSION from shopify-app-react-router

## Overview
Remove the re-exported `LATEST_API_VERSION` constant from the `@shopify/shopify-app-react-router` package and make `apiVersion` a required configuration parameter.

## Scope of Changes

### 1. Core Code Changes

#### 1.1 Remove LATEST_API_VERSION Export
**File:** `packages/apps/shopify-app-react-router/src/server/index.ts`
- Remove LATEST_API_VERSION from the re-exports from `@shopify/shopify-api`
- Keep ApiVersion export for users to reference available versions

#### 1.2 Update shopifyApp Function
**File:** `packages/apps/shopify-app-react-router/src/server/shopify-app.ts`
- Remove import of LATEST_API_VERSION from `@shopify/shopify-api`
- Remove the default fallback: `apiVersion: appConfig.apiVersion ?? LATEST_API_VERSION`
- Make apiVersion required in the configuration validation

#### 1.3 Update Type Definitions
**File:** `packages/apps/shopify-app-react-router/src/server/config-types.ts`
- Change `apiVersion?: ApiVersion` to `apiVersion: ApiVersion` (make it required)
- Update JSDoc comments to remove references to LATEST_API_VERSION
- Update all example code in comments

### 2. Documentation Updates

#### 2.1 Update JSDoc Comments
**Files to update:**
- `packages/apps/shopify-app-react-router/src/server/config-types.ts`
  - Lines 226-240: Remove defaultValue mention and update examples
  - Lines 250-258: Update example code
  
- `packages/apps/shopify-app-react-router/src/server/types.ts`
  - Lines 82, 119, 378, 408, 446: Update import statements in example code
  
- `packages/apps/shopify-app-react-router/src/server/unauthenticated/types.ts`
  - Line 15: Update import statement in example

#### 2.2 Update Example Files
**File:** `packages/apps/shopify-app-react-router/docs/staticPages/examples/index/shopify-app.example.tsx`
- Remove LATEST_API_VERSION import
- Replace with specific ApiVersion value (e.g., `ApiVersion.July25`)

### 3. Test Updates

#### 3.1 Update Test Files
**Files to update:**
- `packages/apps/shopify-app-react-router/src/server/__tests__/shopify-app.test.ts`
  - Remove LATEST_API_VERSION import
  - Update tests to use specific API version
  
- `packages/apps/shopify-app-react-router/src/server/__tests__/override-logger.test.ts`
  - Remove LATEST_API_VERSION import
  - Use specific API version in test config

#### 3.2 Update Test Helpers
**Files to update:**
- `packages/apps/shopify-app-react-router/src/server/__test-helpers/test-config.ts`
- `packages/apps/shopify-app-react-router/src/server/__test-helpers/const.ts`
- `packages/apps/shopify-app-react-router/src/server/__test-helpers/mock-graphql-request.ts`
- `packages/apps/shopify-app-react-router/src/server/__test-helpers/expect-admin-api-client.ts`
- `packages/apps/shopify-app-react-router/src/server/__test-helpers/expect-storefront-api-client.ts`

Replace LATEST_API_VERSION with explicit ApiVersion values.

### 4. Breaking Change Considerations

#### 4.1 Migration Path for Users
Users will need to:
1. Add an explicit `apiVersion` to their shopifyApp configuration
2. Import `ApiVersion` enum instead of LATEST_API_VERSION
3. Choose their desired API version

**Before:**
```typescript
import { LATEST_API_VERSION, shopifyApp } from "@shopify/shopify-app-react-router/server";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  scopes: process.env.SCOPES?.split(",")!,
  appUrl: process.env.SHOPIFY_APP_URL!,
  apiVersion: LATEST_API_VERSION, // or omitted
});
```

**After:**
```typescript
import { ApiVersion, shopifyApp } from "@shopify/shopify-app-react-router/server";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  scopes: process.env.SCOPES?.split(",")!,
  appUrl: process.env.SHOPIFY_APP_URL!,
  apiVersion: ApiVersion.July25, // Now required
});
```

#### 4.2 Error Handling
Add validation in `deriveApi` function to throw a clear error if apiVersion is not provided:
```typescript
if (!appConfig.apiVersion) {
  throw new ShopifyError(
    'apiVersion is required. Please specify an API version from the ApiVersion enum.'
  );
}
```

### 5. Related Package Considerations

Note: Similar changes appear to be needed in:
- `@shopify/shopify-app-remix` package (same refactor pattern)
- Any other packages that re-export LATEST_API_VERSION

### 6. Implementation Steps

1. **Phase 1: Code Changes**
   - Update type definitions to make apiVersion required
   - Remove LATEST_API_VERSION imports and exports
   - Add validation for required apiVersion
   - Update all internal uses to specific versions

2. **Phase 2: Test Updates**
   - Update all test files to use explicit API versions
   - Ensure all tests pass with the new requirement
   - Add tests for missing apiVersion error case

3. **Phase 3: Documentation**
   - Update all JSDoc comments
   - Update example files
   - Regenerate documentation
   - Update migration guide

4. **Phase 4: Release Preparation**
   - Update CHANGELOG.md with breaking change notice
   - Update package version (major version bump due to breaking change)
   - Prepare migration guide for users

### 7. Validation Checklist

- [ ] All LATEST_API_VERSION imports removed
- [ ] apiVersion is required in TypeScript types
- [ ] Runtime validation throws clear error for missing apiVersion
- [ ] All tests updated and passing
- [ ] All documentation examples updated
- [ ] Migration guide prepared
- [ ] No references to LATEST_API_VERSION in comments/docs
- [ ] Generated documentation regenerated

### 8. Communication Plan

1. **Breaking Change Notice:**
   - Clear explanation of why the change is being made
   - Step-by-step migration instructions
   - Benefits of explicit version declaration

2. **Recommended Approach for Users:**
   - Use a specific, stable API version
   - Update to newer versions intentionally after testing
   - Consider using environment variables for API version configuration

### 9. Future Considerations

- Consider adding a helper function to get the latest stable version programmatically if needed
- Document best practices for API version management
- Consider adding warnings for deprecated API versions

## Notes

This change aligns with Shopify's move toward explicit API version declaration, giving developers more control over their API interactions and preventing unexpected breaking changes from automatic version updates.