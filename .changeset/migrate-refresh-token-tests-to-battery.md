---
'@shopify/shopify-app-session-storage-test-utils': patch
'@shopify/shopify-app-session-storage-drizzle': patch
'@shopify/shopify-app-session-storage-prisma': patch
---

Migrate refresh token testing to batteryOfTests

This change consolidates refresh token testing into the shared `batteryOfTests` suite, eliminating duplicate test code across session storage adapters.

To enable refresh token tests in other adapters:
```typescript
// Before
batteryOfTests(async () => storage);

// After (to enable refresh token tests)
batteryOfTests(async () => storage, false, true);
```
