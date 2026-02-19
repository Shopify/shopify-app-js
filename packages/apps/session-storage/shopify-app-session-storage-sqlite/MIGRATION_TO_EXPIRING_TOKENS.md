# Migrating to Expiring Tokens

The `@shopify/shopify-app-session-storage-sqlite` package now supports expiring offline access tokens. The refresh token and its expiration date are now stored as part of the session if your app is using expiring offline access tokens.

## Automatic Migration

The SQLite session storage adapter includes an automatic migration system. When you upgrade to the new version, the migration will run automatically on the first connection to add the required columns:

- `refreshToken` (varchar(255), nullable)
- `refreshTokenExpires` (integer, nullable) - stored as Unix timestamp in seconds

The migration preserves all existing session data and adds the new columns with NULL values for existing sessions.

## Manual Migration (Optional)

If you prefer to run the migration manually, you can execute the following SQL:

```sql
BEGIN TRANSACTION;

-- Rename existing table
ALTER TABLE shopify_sessions RENAME TO shopify_sessions_backup;

-- Create new table with refresh token and individual user info fields
CREATE TABLE shopify_sessions (
  id varchar(255) NOT NULL PRIMARY KEY,
  shop varchar(255) NOT NULL,
  state varchar(255) NOT NULL,
  isOnline integer NOT NULL,
  expires integer,
  scope varchar(1024),
  accessToken varchar(255),
  userId integer,
  firstName varchar(255),
  lastName varchar(255),
  email varchar(255),
  accountOwner integer,
  locale varchar(255),
  collaborator integer,
  emailVerified integer,
  refreshToken varchar(255),
  refreshTokenExpires integer
);

-- Copy data from backup, extracting userId from the old onlineAccessInfo column
-- refreshToken and refreshTokenExpires default to NULL for existing sessions
INSERT INTO shopify_sessions
  (id, shop, state, isOnline, expires, scope, accessToken, userId)
SELECT id, shop, state, isOnline, expires, scope, accessToken,
  CASE WHEN onlineAccessInfo IS NOT NULL THEN CAST(onlineAccessInfo AS INTEGER) ELSE NULL END
FROM shopify_sessions_backup;

-- Drop backup table
DROP TABLE shopify_sessions_backup;

COMMIT;
```

**Note**: If you use a custom table name via the `sessionTableName` option, replace `shopify_sessions` with your table name.

## Using Refresh Tokens

After the migration, refresh tokens will be automatically stored when your app uses expiring offline access tokens.

You can enable expiring offline access tokens in the `shopifyApp` configuration:

```typescript
import {shopifyApp} from '@shopify/shopify-app-react-router/server';
import {SQLiteSessionStorage} from '@shopify/shopify-app-session-storage-sqlite';

const shopify = shopifyApp({
  sessionStorage: new SQLiteSessionStorage('/path/to/your.db'),
  future: {
    expiringOfflineAccessTokens: true,
  },
  // ... other config
});
```

The refresh token will be available on the `Session` object via `session.refreshToken` and `session.refreshTokenExpires`.

## Backward Compatibility

This change is fully backward compatible:
- Existing sessions without refresh tokens continue to work
- The new columns are nullable and won't affect existing functionality
- Apps that don't use expiring offline access tokens are unaffected
