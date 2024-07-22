# Migrating to v12

This document outlines the changes you need to make to your app to migrate from v11 to v12 of this package.

## Shopify managed pricing support

With [Shopify managed pricing](https://shopify.dev/docs/apps/launch/billing/managed-pricing), apps can set up billing when publishing to the App Store, rather than using the Admin API. In order to properly support that case, the `billing.check` and `billing.subscriptions` methods have changed.

Now, you can call those methods even if you don't have a billing configuration, so you can check the status of the current merchant before rendering your app. If you're using the `request` method, you'll still need a `billing` configuration with the details of the plans so subscriptions can be created.

The `billing.check` method will now always return an object, but it contains the previous result as well, so you can migrate using this code:

```ts
// Before
const result = shopify.billing.check({
  session,
  isTest: true,
  plans: ['My plan 1', 'My plan 2'],
  // This parameter no longer exists, but no changes are required if it is true
  returnObject: false,
});

if (result === true) {
  // App-specific code
}

// After
const result = shopify.billing.check({
  session,
  isTest: true,
  plans: ['My plan 1', 'My plan 2'],
});

if (result.hasActivePayment === true) {
  // App-specific code
}
```
