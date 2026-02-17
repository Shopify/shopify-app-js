---
'@shopify/shopify-app-session-storage-memory': patch
---

Add test coverage for refresh token storage using the centralized `batteryOfTests` suite. Memory storage already supports refresh tokens (it stores the complete Session object), but this change adds explicit test verification.

**Note**: This is a test-only change. Memory storage automatically preserves all Session fields including `refreshToken` and `refreshTokenExpires` without requiring any code changes or migrations.
