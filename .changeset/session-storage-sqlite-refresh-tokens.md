---
'@shopify/shopify-app-session-storage-sqlite': minor
---

Add support for storing refresh tokens and refresh token expiration dates. This enables apps using expiring offline access tokens to automatically refresh tokens without user re-authentication.

## Automatic Migration

The SQLite session storage adapter includes an automatic migration system. When you upgrade to the new version, the migration will run automatically on the first connection to add the required columns:

- `refreshToken` (varchar(255), nullable)
- `refreshTokenExpires` (integer, nullable) - stored as Unix timestamp in seconds

The migration preserves all existing session data and adds the new columns with NULL values for existing sessions.

## Using Refresh Tokens

**Important**: When you upgrade to this version, the migration runs automatically on your next app start/first database connection. Once the migration completes, you can safely enable the feature flag.

To enable expiring offline access tokens:

```typescript
import {shopifyApp} from '@shopify/shopify-app-react-router/server';
import {SQLiteSessionStorage} from '@shopify/shopify-app-session-storage-sqlite';

const shopify = shopifyApp({
  future: {
    expiringOfflineAccessTokens: true,
  },
  sessionStorage: new SQLiteSessionStorage('/path/to/your.db'),
  // ... other config
});
```

Refresh tokens will be automatically stored when your app uses expiring offline access tokens. The refresh token is available on the `Session` object via `session.refreshToken` and `session.refreshTokenExpires`.

## Manual Migration (Optional)

If you prefer to run the migration manually, you can execute the following SQL:

```sql
BEGIN TRANSACTION;

-- Rename existing table
ALTER TABLE shopify_sessions RENAME TO shopify_sessions_backup;

-- Create new table with refresh token fields
CREATE TABLE shopify_sessions (
  id varchar(255) NOT NULL PRIMARY KEY,
  shop varchar(255) NOT NULL,
  state varchar(255) NOT NULL,
  isOnline integer NOT NULL,
  expires integer,
  scope varchar(1024),
  accessToken varchar(255),
  onlineAccessInfo varchar(255),
  refreshToken varchar(255),
  refreshTokenExpires integer
);

-- Copy data from backup
INSERT INTO shopify_sessions
  (id, shop, state, isOnline, expires, scope, accessToken, onlineAccessInfo)
SELECT id, shop, state, isOnline, expires, scope, accessToken, onlineAccessInfo
FROM shopify_sessions_backup;

-- Drop backup table
DROP TABLE shopify_sessions_backup;

COMMIT;
```

**Note**: If you use a custom table name via the `sessionTableName` option, replace `shopify_sessions` with your table name.

## Backward Compatibility

This change is fully backward compatible:
- Existing sessions without refresh tokens continue to work
- The new columns are nullable and won't affect existing functionality
- Apps that don't use expiring offline access tokens are unaffected
