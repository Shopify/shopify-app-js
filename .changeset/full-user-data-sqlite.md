---
'@shopify/shopify-app-session-storage-sqlite': major
---

Store full online access user data (firstName, lastName, email, accountOwner, locale, collaborator, emailVerified) instead of only a numeric user ID. Previously the adapter serialised online session user info into a single `onlineAccessInfo` column containing just the user ID string, silently discarding all other user fields. Sessions now round-trip the complete user object.

## Automatic Migration

The SQLite session storage adapter includes an automatic migration system. When you upgrade to the new version, the migration will run automatically on the first connection. It replaces the single `onlineAccessInfo` column with individual typed columns:

- `userId` (integer, nullable). Preserved from the old `onlineAccessInfo` value
- `firstName` (varchar(255), nullable)
- `lastName` (varchar(255), nullable)
- `email` (varchar(255), nullable)
- `accountOwner` (integer, nullable). Stored as 0/1
- `locale` (varchar(255), nullable)
- `collaborator` (integer, nullable). Stored as 0/1
- `emailVerified` (integer, nullable). Stored as 0/1

Existing sessions retain their `userId`. All other user fields (`firstName`, `lastName`, etc.) will be `NULL` for pre-existing rows and will be populated on the user's next authentication.

## Breaking Change

If your application queries the `shopify_sessions` table directly and reads the `onlineAccessInfo` column, you will need to update those queries to use the new individual columns after migration.

## Manual Migration (Optional)

If you prefer to run the migration manually before deploying, execute the following SQL:

```sql
BEGIN TRANSACTION;

-- Rename existing table
ALTER TABLE shopify_sessions RENAME TO shopify_sessions_backup;

-- Create new table with individual user info columns
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
  emailVerified integer
);

-- Copy data, preserving userId from the old onlineAccessInfo column
INSERT INTO shopify_sessions (id, shop, state, isOnline, expires, scope, accessToken, userId)
  SELECT id, shop, state, isOnline, expires, scope, accessToken,
    CASE WHEN onlineAccessInfo IS NOT NULL THEN CAST(onlineAccessInfo AS INTEGER) ELSE NULL END
  FROM shopify_sessions_backup;

-- Drop backup table
DROP TABLE shopify_sessions_backup;

COMMIT;
```

**Note**: If you use a custom table name via the `sessionTableName` option, replace `shopify_sessions` with your table name.

## Backward Compatibility

- Existing offline sessions are unaffected
- Existing online sessions retain their `userId`; all other user fields will be populated on next sign-in
- Apps that do not read user info fields from sessions are unaffected
