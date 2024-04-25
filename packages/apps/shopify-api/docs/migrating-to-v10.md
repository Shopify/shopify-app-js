# Migrating to v10

This document outlines the changes you need to make to your app to migrate from v9 to v10 of this package.

## `Scopes` on config object are now optional

The `scopes` property on the config object is now optional. If your app is using the new [managed install flow](https://shopify.dev/docs/apps/auth/installation), it is now recommended you omit the `scopes` property from the config object.

Using both the `scopes` property and managed install can lead to unexpected behavior if these values are not kept in sync.

If you are directly accessing the scopes from the config object, you should update your code to handle the case where the `scopes` property is not present.

For example, but not limited to:
```js
// Before
const scopes = shopify.config.scopes.toString();

// After
const scopes = shopify.config.scopes
      ? shopify.config.scopes.toString()
      : '';
```

## v10_lineItemBilling future flag has been renamed to lineItemBilling

The `lineItemBilling` feature will **not** be enabled by default in v10. Because of this it has been renamed `lineItemBilling`. If you are using the `v10_lineItemBilling` future flag, you can optionally update your code to use the `lineItemBilling` feature flag instead.
