---
'@shopify/shopify-app-session-storage-sqlite': minor
---

Add support for storing refresh tokens and refresh token expiration dates. This enables apps using expiring offline access tokens to automatically refresh tokens without user re-authentication.

## Migration Guide

### Step 1: Update your schema

The SQLite session storage includes an automatic migration system. When you upgrade to this version, the migration will run automatically on the first connection to add the required columns:

- `refreshToken` (varchar(255), nullable)
- `refreshTokenExpires` (integer, nullable)

The migration preserves all existing session data and adds the new columns with NULL values for existing sessions.

If you prefer to run the migration manually, you can execute the SQL provided in `MIGRATION_TO_EXPIRING_TOKENS.md`.

### Step 2: Enable the feature

Update your app configuration to enable expiring offline access tokens:

```typescript
import {shopifyApp} from '@shopify/shopify-app-express';
import {SQLiteSessionStorage} from '@shopify/shopify-app-session-storage-sqlite';

const shopify = shopifyApp({
  sessionStorage: new SQLiteSessionStorage('/path/to/your.db'),
  future: {
    expiringOfflineAccessTokens: true,
  },
  // ... other config
});
```

### Step 3: Verify

- New OAuth flows will automatically store refresh tokens
- Existing sessions continue to work without refresh tokens (fields are optional)

For detailed instructions, see `MIGRATION_TO_EXPIRING_TOKENS.md` in this package.
