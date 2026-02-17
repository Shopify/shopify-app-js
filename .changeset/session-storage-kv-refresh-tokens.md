---
'@shopify/shopify-app-session-storage-kv': patch
---

Add test coverage for refresh token storage using the centralized batteryOfTests suite. KV storage already supports refresh tokens (it uses Session.toPropertyArray/fromPropertyArray which includes refresh token fields), but this change adds explicit test verification.

**Note**: This is a test-only change. No code changes or migrations required.
