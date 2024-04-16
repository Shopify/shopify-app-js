# Migrating to v10

This document outlines the changes you need to make to your app to migrate from v9 to v10 of this package.

## `Scopes` on config object are now optional

The `scopes` property on the config object is now optional. If your app is using the new [managed install flow](https://shopify.dev/docs/apps/auth/installation), it is now recommended you omit the `scopes` property from the config object.

Using both the `scopes` property and managed install can lead to unexpected behavior if these values are not kept in sync.
