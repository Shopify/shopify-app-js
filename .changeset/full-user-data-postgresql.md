---
'@shopify/shopify-app-session-storage-postgresql': major
---

Store full online access user data (firstName, lastName, email, accountOwner, locale, collaborator, emailVerified) instead of only a numeric user ID. Previously the adapter serialised online session user info into a single `onlineAccessInfo` column containing just the user ID string, silently discarding all other user fields. Sessions now round-trip the complete user object.

## Automatic Migration

The PostgreSQL session storage adapter includes an automatic migration system. When you upgrade to the new version, the migration will run automatically on the first connection. It replaces the single `onlineAccessInfo` column with individual typed columns:

- `userId` (bigint, nullable) — preserved from the old `onlineAccessInfo` value
- `firstName` (varchar(255), nullable)
- `lastName` (varchar(255), nullable)
- `email` (varchar(255), nullable)
- `accountOwner` (boolean, nullable)
- `locale` (varchar(255), nullable)
- `collaborator` (boolean, nullable)
- `emailVerified` (boolean, nullable)

The migration runs inside a transaction. Existing sessions retain their `userId`. All other user fields (`firstName`, `lastName`, etc.) will be `NULL` for pre-existing rows and will be populated on the user's next authentication.

## Breaking Change

If your application queries the `shopify_sessions` table directly and reads the `onlineAccessInfo` column, you will need to update those queries to use the new individual columns after migration.

## Manual Migration (Optional)

If you prefer to run the migration manually before deploying, execute the following SQL:

```sql
BEGIN;

-- Add new individual user info columns
ALTER TABLE "shopify_sessions"
  ADD COLUMN "userId" bigint,
  ADD COLUMN "firstName" varchar(255),
  ADD COLUMN "lastName" varchar(255),
  ADD COLUMN "email" varchar(255),
  ADD COLUMN "accountOwner" boolean,
  ADD COLUMN "locale" varchar(255),
  ADD COLUMN "collaborator" boolean,
  ADD COLUMN "emailVerified" boolean;

-- Preserve userId from the old onlineAccessInfo column
UPDATE "shopify_sessions"
  SET "userId" = CAST("onlineAccessInfo" AS BIGINT)
  WHERE "onlineAccessInfo" IS NOT NULL;

-- Drop the old column
ALTER TABLE "shopify_sessions" DROP COLUMN "onlineAccessInfo";

COMMIT;
```

**Note**: If you use a custom table name via the `sessionTableName` option, replace `shopify_sessions` with your table name.

## Backward Compatibility

- Existing offline sessions are unaffected
- Existing online sessions retain their `userId`; all other user fields will be populated on next sign-in
- Apps that do not read user info fields from sessions are unaffected
