# shopify.auth.migrateToExpiringToken

Exchanges a non-expiring offline access token for an expiring offline access token and a refresh token.

This is part of the migration process to move from non-expiring offline tokens to expiring ones for better security.

> [!WARNING]
> This is a **one-time, irreversible migration** per shop. Once you migrate a shop's token to an expiring token, you cannot convert it back to a non-expiring token. The shop would need to reinstall your app with `expiring_offline_access_tokens: false` in your Context configuration to obtain a new non-expiring token.

## Examples

### Node.js

```ts
const response = await shopify.auth.migrateToExpiringToken({
  shop: 'my-shop.myshopify.com',
  nonExpiringOfflineAccessToken: 'existing-offline-token',
});

const {session} = response;
// Save the new session which now contains an expiring access token and a refresh token
```

## Parameters

### shop

`string` | required

A Shopify domain name in the form `{exampleshop}.myshopify.com`.

### nonExpiringOfflineAccessToken

`string` | required

The existing non-expiring offline access token that you want to exchange.

## Return

`Promise<{session: Session}>`

Returns a promise resolving to an object containing the new [`Session`](../../../lib/session/session.ts) with the expiring offline access token and refresh token.


## Migration Strategy

When migrating your app to use expiring tokens, follow this order:

1. **Update your prisma schema** to add `refreshToken` (String?) and `refreshTokenExpires` (DateTime?) columns.
    ```prisma
    model Session {
        id            String    @id
        shop          String
        ...
        refreshToken  String? // new column
        refreshTokenExpires DateTime? // new column
    }
    ```
2. Run the following prisma commands to update the database schema:
    ```sh
    npx prisma migrate dev
    ```
3. **Update Types**

    Update the generated types to include the new fields:
    ```sh
    npx prisma generate
    ```
4. **Enable expiring tokens in your config setup** so new installations will request and receive expiring tokens:
   ```js
    const shopify = shopifyApi({
        apiKey: 'APIKeyFromPartnersDashboard',
        apiSecretKey: 'APISecretFromPartnersDashboard',
        ...
        expiringOfflineAccessTokens: true
    });
   ```
5. **Implement refresh logic** in your app to handle token expiration using `shopify.auth.refreshToken`
6. **Migrate existing non-expiring tokens** for shops that have already installed your app using the migration method above

    You can use a background job to migrate your existing shops. Here is an example script using Prisma:

    ```ts
    import prisma from "../db.server"; // your prisma client instance
    import { shopifyApi, ApiVersion } from "@shopify/shopify-api";
    import { sessionStorage } from "../shopify.server"; // Your session storage instance
    // Create a shopifyApi instance for migration operations
    const shopify = shopifyApi({
      apiKey: process.env.SHOPIFY_API_KEY || "",
      apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
      apiVersion: ApiVersion.October25,
      scopes: process.env.SCOPES?.split(",") || [],
      hostName: (process.env.SHOPIFY_APP_URL || "").replace(/^https?:\/\//, ""),
      isEmbeddedApp: true,
    });

    async function migrateShops() {
      // 1. Fetch all offline sessions that haven't been migrated yet
      const sessions = await prisma.session.findMany({
        where: {
          isOnline: false,
          expires: null,
          refreshToken: null,
        },
      });

      console.log(`Found ${sessions.length} sessions to migrate.`);

      for (const session of sessions) {
        if (!session.accessToken) continue;

        try {
          console.log(`Migrating shop: ${session.shop}`);

          // 2. Exchange the token
          const response = await shopify.auth.migrateToExpiringToken({
            shop: session.shop,
            nonExpiringOfflineAccessToken: session.accessToken,
          });

          // 3. Save the new session (updates the existing record with refresh token)
          await sessionStorage.storeSession(response.session);

          console.log(`Successfully migrated ${session.shop}`);
        } catch (error) {
          console.error(`Failed to migrate ${session.shop}:`, error);
        }
      }
    }

    migrateShops();
    ```

[Back to shopify.auth](./README.md)

