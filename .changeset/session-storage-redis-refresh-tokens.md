---
'@shopify/shopify-app-session-storage-redis': patch
---

Add test coverage for refresh token storage using the centralized batteryOfTests suite. Redis storage already supports refresh tokens (it stores the complete Session object), but this change adds explicit test verification.

**Note**: This is a test-only change. No code changes or migrations required.
