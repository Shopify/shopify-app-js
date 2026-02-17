---
'@shopify/shopify-app-session-storage-memory': minor
---

Add support for storing refresh tokens and refresh token expiration dates. This enables apps using expiring offline access tokens to automatically refresh tokens without user re-authentication.

**No migration required**: The memory storage automatically preserves all Session fields, including refresh tokens.
