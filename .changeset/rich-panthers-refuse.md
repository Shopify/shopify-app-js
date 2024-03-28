---
"@shopify/shopify-app-session-storage-prisma": major
"@shopify/shopify-app-session-storage-test-utils": patch
---

# Store user information as part of the session

With this change when using online access tokens, the user information is stored as part of the session. Previously only the user ID was stored. This will enable changing of page content or limiting of page visibility by user, as well as unlock logging users actions. This is a breaking change, as the Primsa schema has been updated to include the user information.

Please see the [migration guide](/packages/shopify-app-session-storage-prisma/MIGRATION_V5.md) for more information on how to update your app to use the new session data.

<details>
The new session will include the following data:

```ts
 {
    id: 'online_session_id',
    shop: 'online-session-shop',
    state: 'online-session-state',
    isOnline: true,
    scope: 'online-session-scope',
    accessToken: 'online-session-token',
    expires: 2022-01-01T05:00:00.000Z,
    onlineAccessInfo: {
      associated_user: {
        id: 1,
        first_name: 'online-session-first-name'
        last_name: 'online-session-last-name',
        email: 'online-session-email',
        locale: 'online-session-locale',
        email_verified: false,
        account_owner: true,
        collaborator: false,
      },
    }
  }
```

You will be able to access the user information on the Session object:

```ts
  const { admin, session } = await authenticate.admin(request);

  console.log("user id", session.onlineAccessInfo.associated_user.id);
  console.log("user email", session.onlineAccessInfo.associated_user.email);
  console.log("account owner", session.onlineAccessInfo.associated_user.account_owner);
```

</details>


