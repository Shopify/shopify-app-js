---
'@shopify/shopify-app-session-storage-test-utils': major
---

Remove `testUserInfo` and `testRefreshTokens` flags from `batteryOfTests`

`batteryOfTests` now always tests full user info and refresh token round-trips.
The optional boolean parameters have been removed — update any call sites by
dropping the boolean arguments:

```typescript
// Before
batteryOfTests(async () => storage, true, true);

// After
batteryOfTests(async () => storage);
```
