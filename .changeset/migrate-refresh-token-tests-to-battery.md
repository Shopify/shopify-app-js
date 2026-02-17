---
'@shopify/shopify-app-session-storage-test-utils': patch
---

Add refresh token testing support to batteryOfTests

The `batteryOfTests` function now accepts an optional third parameter to enable refresh token tests, allowing session storage adapters to easily verify refresh token functionality.

```typescript
// Enable refresh token tests
batteryOfTests(async () => storage, false, true);
```
