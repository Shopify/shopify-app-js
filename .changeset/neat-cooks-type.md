---
'@shopify/shopify-app-session-storage-prisma': major
---
## Store user information as part of the session

With this change, OAuth refresh tokens and their expiration dates are now stored as part of the session. Previously, only access tokens were persisted. This enables automatic token refresh for long-lived sessions, reducing the need for users to re-authenticate when access tokens expire. This is a backward-compatible change, as the new Prisma schema fields are optional and existing sessions will continue to work without modification.

<details>

The session object now includes the following additional fields:

```ts
{
  id: 'offline_session_id',
  shop: 'my-shop.myshopify.com',
  state: 'session-state',
  isOnline: false,
  scope: 'read_products,write_orders',
  accessToken: 'shpat_abc123',
  expires: 2025-11-17T18:00:00.000Z,
  refreshToken: 'shprt_def456',           // New field
  refreshTokenExpires: 2025-12-17T18:00:00.000Z,  // New field
}
```

You will be able to access the refresh token information on the Session object once you migrate your schema.

To migrate your schema:

1. Add the new fields to your `Session` model in the Prisma Schema:

```prisma
model Session {
  // ...
  refreshToken        String?
  refreshTokenExpires DateTime?
}
```

2. Run the migration command:

```sh
npx prisma migrate dev
```

3. Update the generated types to include the new fields:

```sh
npx prisma generate
```

Usage:

```ts
const session = await sessionStorage.loadSession(sessionId);

console.log('refresh token', session.refreshToken);
console.log('refresh token expires', session.refreshTokenExpires);

// Check if refresh token is available
if (session.refreshToken) {
  // Use refresh token to get a new access token
}
```

</details>
