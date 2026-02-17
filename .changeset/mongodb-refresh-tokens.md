---
'@shopify/shopify-app-session-storage-mongodb': patch
---

Add test coverage for refresh token storage using the centralized `batteryOfTests` suite. MongoDB storage already supports refresh tokens (it stores the complete Session object), but this change adds explicit test verification.

**Note**: This is a test-only change. MongoDB storage automatically preserves all Session fields including `refreshToken` and `refreshTokenExpires` without requiring any code changes or migrations.
