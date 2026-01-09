# Upcoming breaking changes

This file contains every breaking change that's currently planned for this package.
You can use it as a guide for migrating your app, and ensuring you're ready for the next big migration.

> **Note**: Every change in this file comes with a deprecated alternative for apps that haven't been updated yet.
> Our goal is to give developers as much time as possible to prepare for changes to reduce the burden of staying up to date.

## Table of contents

- [Use new authentication strategy for embedded apps](#use-new-authentication-strategy-for-embedded-apps)
- [Enable expiring offline access tokens](#enable-expiring-offline-access-tokens)

## Use new authentication strategy for embedded apps

> [!NOTE]
> The `unstable_newEmbeddedAuthStrategy` future flag enabled this behaviour.
> If you've already enabled the flag, you don't need to follow these instructions.

Shopify apps can now use [OAuth token exchange](https://shopify.dev/docs/apps/auth/get-access-tokens/token-exchange) to obtain an API access token without having to redirect the user, which makes the process much faster, and less error prone.

This package will automatically use token exchange, but that only works if [Shopify managed installation](https://shopify.dev/docs/apps/auth/installation#shopify-managed-installation) is enabled for the app.
Before updating this package in your app, please ensure you've enabled managed installation.

For more details on how this works, please see the [new embedded authorization strategy](../README.md#new-embedded-authorization-strategy) section in the README.

## Enable expiring offline access tokens
> [!NOTE]
> The `expiringOfflineAccessTokens` future flag enables this behaviour.
> If you've already enabled the flag, you don't need to follow these instructions.
Shopify is moving towards expiring offline access tokens for better security. Traditionally, offline access tokens did not expire, but now they can have a limited lifetime and require refreshing.
To enable this feature in your app:
1.  **Update your database schema**: Ensure your Session table includes `refreshToken` and `refreshTokenExpires` columns.
2.  **Enable the configuration**: Set `expiringOfflineAccessTokens: true` in your `shopifyApp` `future` configuration.
```ts
const shopify = shopifyApp({
  // ...
  future: {
    expiringOfflineAccessTokens: true,
  },
});
```
When enabled, the package will automatically handle token refreshing when necessary during authentication.
Learn more about [Expiring Access Tokens](../../../shopify-api/docs/guides/oauth.md#expiring-access-tokens).