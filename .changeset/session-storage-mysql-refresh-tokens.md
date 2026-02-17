---
'@shopify/shopify-app-session-storage-mysql': minor
---

Add support for storing refresh tokens and refresh token expiration dates. This enables apps using expiring offline access tokens to automatically refresh tokens without user re-authentication.

## Migration Guide

### Step 1: Update your schema

The package includes an automatic migration that will run on the first connection after upgrading. The migration adds:
- `refreshToken` column (text, nullable)
- `refreshTokenExpires` column (timestamp, nullable)

If you prefer to run the migration manually, execute:

```sql
ALTER TABLE shopify_sessions
  ADD COLUMN refreshToken text,
  ADD COLUMN refreshTokenExpires timestamp NULL;
```

Replace `shopify_sessions` with your table name if you've configured a custom `sessionTableName`.

### Step 2: Enable the feature

Update your app configuration to enable expiring offline access tokens:

```typescript
future: {
  expiringOfflineAccessTokens: true,
}
```

### Step 3: Verify

- New OAuth flows will automatically store refresh tokens
- Existing sessions continue to work without refresh tokens (fields are optional)

For detailed instructions, see `MIGRATION_TO_EXPIRING_TOKENS.md` in this package.
