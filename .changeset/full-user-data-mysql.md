---
'@shopify/shopify-app-session-storage-mysql': major
---

Store full online access user data (firstName, lastName, email, accountOwner, locale, collaborator, emailVerified) instead of only a numeric user ID. Previously the adapter serialised online session user info into a single `onlineAccessInfo` column containing just the user ID string, silently discarding all other user fields. Sessions now round-trip the complete user object.

## Automatic Migration

The MySQL session storage adapter includes an automatic migration system. When you upgrade to the new version, the migration will run automatically on the first connection. It replaces the single `onlineAccessInfo` column with individual typed columns:

- `userId` (BIGINT, nullable) — preserved from the old `onlineAccessInfo` value
- `firstName` (varchar(255), nullable)
- `lastName` (varchar(255), nullable)
- `email` (varchar(255), nullable)
- `accountOwner` (tinyint, nullable) — stored as 0/1
- `locale` (varchar(255), nullable)
- `collaborator` (tinyint, nullable) — stored as 0/1
- `emailVerified` (tinyint, nullable) — stored as 0/1

Existing sessions retain their `userId`. All other user fields (`firstName`, `lastName`, etc.) will be `NULL` for pre-existing rows and will be populated on the user's next authentication.

## Breaking Change

If your application queries the `shopify_sessions` table directly and reads the `onlineAccessInfo` column, you will need to update those queries to use the new individual columns after migration.

## Manual Migration (Optional)

If you prefer to run the migration manually before deploying, execute the following SQL:

```sql
-- Add new individual user info columns
ALTER TABLE `shopify_sessions`
  ADD COLUMN `userId` BIGINT,
  ADD COLUMN `firstName` varchar(255),
  ADD COLUMN `lastName` varchar(255),
  ADD COLUMN `email` varchar(255),
  ADD COLUMN `accountOwner` tinyint,
  ADD COLUMN `locale` varchar(255),
  ADD COLUMN `collaborator` tinyint,
  ADD COLUMN `emailVerified` tinyint;

-- Preserve userId from the old onlineAccessInfo column
UPDATE `shopify_sessions`
  SET `userId` = CAST(`onlineAccessInfo` AS UNSIGNED)
  WHERE `onlineAccessInfo` IS NOT NULL;

-- Drop the old column
ALTER TABLE `shopify_sessions` DROP COLUMN `onlineAccessInfo`;
```

**Note**: If you use a custom table name via the `sessionTableName` option, replace `shopify_sessions` with your table name.

## Backward Compatibility

- Existing offline sessions are unaffected
- Existing online sessions retain their `userId`; all other user fields will be populated on next sign-in
- Apps that do not read user info fields from sessions are unaffected
