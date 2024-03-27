# Migrating to `v.5.0.0`

Version `5.0.0` of the `@shopify/shopify-app-session-storage-prisma` introduces a breaking change to the session storage schema. The user information is now stored as part of the session. Previously only the user ID was stored. This change requires updating the Prisma schema to include the user information.

## Updating the Prisma schema

Update the `Session` model in the Prisma schema to include the user information:

```prisma
model Session {
  id            String    @id
  shop          String
  state         String
  isOnline      Boolean   @default(false)
  scope         String?
  expires       DateTime?
  accessToken   String
  userId        BigInt?
  // New fields
  firstName     String?
  lastName      String?
  email         String?
  accountOwner  Boolean   @default(false)
  locale        String?
  collaborator  Boolean?  @default(false)
  emailVerified Boolean?  @default(false)
}
```

Run the following prisma commands to update the database schema:

```sh
npx prisma migrate dev
```

### Update Types

Update the generated types to include the new fields:

```ts
npx prisma generate
```

## Using the user information
The user information will now be available on the `Session` object:

```ts
  const { admin, session } = await authenticate.admin(request);

  console.log("user id", session.onlineAccessInfo.associated_user.id);
  console.log("user email", session.onlineAccessInfo.associated_user.email);
  console.log("account owner", session.onlineAccessInfo.associated_user.account_owner);
```
