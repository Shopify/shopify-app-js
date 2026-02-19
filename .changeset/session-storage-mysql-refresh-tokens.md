---
'@shopify/shopify-app-session-storage-mysql': minor
---

Add support for storing refresh tokens and refresh token expiration dates. This enables apps using expiring offline access tokens to automatically refresh tokens without user re-authentication.

## What Changed

Two new columns have been added to the session storage table to support expiring offline access tokens:

- `refreshToken` (varchar(255), nullable) - Stores the refresh token used to obtain new access tokens
- `refreshTokenExpires` (integer, nullable) - Stores the expiration date of the refresh token

## Automatic Migration

When you upgrade to this version, the package will automatically run a migration to add the new columns to your existing session table. No manual intervention is required.

The migration is idempotent and safe to run multiple times.

## Manual Migration

If you prefer to run the migration manually before upgrading, execute the following SQL:

```sql
ALTER TABLE shopify_sessions
  ADD COLUMN refreshToken varchar(255),
  ADD COLUMN refreshTokenExpires integer NULL;
```

Replace `shopify_sessions` with your table name if you have configured a custom `sessionTableName`.

## How to Enable

To use expiring offline access tokens, update your app configuration:

```typescript
import {shopifyApp} from '@shopify/shopify-app-react-router/server';
import {MySQLSessionStorage} from '@shopify/shopify-app-session-storage-mysql';

const shopify = shopifyApp({
  future: {
    expiringOfflineAccessTokens: true,
  },
  sessionStorage: new MySQLSessionStorage(
    'mysql://username:password@host/database',
  ),
  // ... other config
});
```

The migration runs automatically at startup before any database operations, so the columns will be ready when your app starts handling sessions with refresh tokens.

## Notes

- Existing sessions will continue to work without refresh tokens (the new fields are nullable)
- New OAuth flows will automatically store refresh tokens when the feature is enabled
- The refresh token expiration is stored in seconds in the database and converted to milliseconds when loaded into the Session object
