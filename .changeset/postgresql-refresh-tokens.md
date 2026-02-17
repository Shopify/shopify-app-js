---
'@shopify/shopify-app-session-storage-postgresql': minor
---

Add support for storing refresh tokens and refresh token expiration dates. This enables apps using expiring offline access tokens to automatically refresh tokens without user re-authentication.

## Migration Guide

### Step 1: Update your database schema

The package includes an automatic migration system that will update your database when you upgrade. The migration will add two new nullable columns to your session table:
- `refreshToken` (varchar 255)
- `refreshTokenExpires` (bigint)

The migration runs automatically when your application starts. No manual intervention required.

**Manual Migration (Optional)**: If you prefer to run the migration manually:

```sql
ALTER TABLE "shopify_sessions"
ADD COLUMN "refreshToken" varchar(255),
ADD COLUMN "refreshTokenExpires" bigint;
```

### Step 2: Enable the feature

Update your app configuration to enable expiring offline access tokens:

```typescript
import {shopifyApp} from '@shopify/shopify-app-express';
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

### Step 3: Verify

- New OAuth flows will automatically store refresh tokens
- Existing sessions continue to work without refresh tokens (fields are optional)
- The migration is tracked in your migrations table to prevent duplicate execution

For detailed instructions, see `MIGRATION_TO_EXPIRING_TOKENS.md` in this package.
