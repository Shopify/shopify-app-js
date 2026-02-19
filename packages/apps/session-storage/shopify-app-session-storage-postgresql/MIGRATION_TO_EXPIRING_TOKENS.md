# Migrating to Expiring Tokens

The `@shopify/shopify-app-session-storage-postgresql` package now supports expiring offline access tokens. The refresh token and its expiration date are now stored as part of the session if your app is using expiring offline access tokens.

## Automatic Migration

The package includes an automatic migration system that will update your database when you upgrade. The migration adds two new nullable columns to your session table:

- `refreshToken` (varchar 255) - stores the refresh token string
- `refreshTokenExpires` (bigint) - stores the refresh token expiration as a millisecond timestamp

The migration runs automatically when your application starts. No manual intervention is required.

## Manual Migration (Optional)

If you prefer to run the migration manually:

```sql
ALTER TABLE "shopify_sessions"
ADD COLUMN "refreshToken" varchar(255),
ADD COLUMN "refreshTokenExpires" bigint;
```

## Enabling Expiring Offline Access Tokens

Update your app configuration to enable expiring offline access tokens:

```typescript
import {shopifyApp} from '@shopify/shopify-app-react-router/server';
import {PostgreSQLSessionStorage} from '@shopify/shopify-app-session-storage-postgresql';

const shopify = shopifyApp({
  sessionStorage: new PostgreSQLSessionStorage(
    'postgres://username:password@host/database',
  ),
  future: {
    expiringOfflineAccessTokens: true,
  },
  // ... other config
});
```

## Using the Refresh Token

The refresh token will now be available on the `Session` object if your app is using expiring offline access tokens.

- New OAuth flows will automatically store refresh tokens.
- Existing sessions continue to work without refresh tokens (the new fields are optional/nullable).
- The migration is tracked in the migrations table to prevent duplicate execution.

## Backward Compatibility

This change is fully backward compatible:

- The new columns are nullable, so existing sessions are unaffected.
- Applications that do not enable `expiringOfflineAccessTokens` will not store or use refresh tokens.
- The `storeSession` method dynamically handles fields, so it works with or without refresh token data.
