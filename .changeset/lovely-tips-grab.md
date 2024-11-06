---
'@shopify/shopify-app-session-storage-prisma': minor
---

Adds `isConnected` method to `PrismaSessionStorage`. `isConnected` will poll based on the configuration or until the table is found to exist. If the table is not found within the timeout, it will return `false`.

`isConnected` will update the internal state of the `PrismaSessionStorage` instance to reflect whether the session table exists and can be used. In case of an unexpected disconnect, use `isConnected` to check if the table has recovered. 

Example usage on a Remix app:
```ts
import { sessionStorage } from "../shopify.server";
// ...
if (await sessionStorage.isConnected()) {
  // ...
}
```

An equivalent method will soon be available on the `SessionStorage` interface and all other session storage implementations.
