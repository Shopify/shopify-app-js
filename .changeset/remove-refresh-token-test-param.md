---
'@shopify/shopify-app-session-storage-test-utils': major
---

BREAKING: batteryOfTests now always tests refresh token functionality

The optional `testRefreshTokens` parameter has been removed from `batteryOfTests`. Refresh token tests now run by default for all session storage adapters.

**Migration:** Remove the third parameter from any `batteryOfTests` calls:

```typescript
// Before
batteryOfTests(async () => storage, false, true);

// After
batteryOfTests(async () => storage);
```

All session storage adapters are now required to support refresh token storage.
