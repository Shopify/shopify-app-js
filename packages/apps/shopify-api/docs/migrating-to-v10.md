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
const scopes = shopify.config.scopes ? shopify.config.scopes.toString() : '';
```

## v10_lineItemBilling future flag has been renamed to lineItemBilling

The `lineItemBilling` feature will **not** be enabled by default in v10. Because of this it has been renamed `lineItemBilling`. If you are using the `v10_lineItemBilling` future flag, you can optionally update your code to use the `lineItemBilling` feature flag instead.

## Webhook validation no longer returns `MissingHeaders` when HMAC header is missing

Webhook validation will now return a different `reason` value when the HMAC value is missing from the request.

Instead of returning `WebhookValidationErrorReason.MissingHeaders` as it does for the other headers it validates, it will now return a new `WebhookValidationErrorReason.MissingHmac` error so this check matches other HMAC validations.

```ts
import {type WebhookValidationErrorReason} from '@shopify/shopify-api';

const check = await shopify.webhooks.validate({
  rawBody: (req as any).rawBody,
  rawRequest: req,
  rawResponse: res,
});

// Before
if (
  !check.valid &&
  check.reason === WebhookValidationErrorReason.MissingHeaders &&
  check.missingHeaders.includes(ShopifyHeader.Hmac)
) {
  // Handle error
}

// After
if (!check.valid && check.reason === WebhookValidationErrorReason.MissingHmac) {
  // Handle error
}
```

## Internal build paths changed to introduce ESM and CJS exports

We started exporting both CJS and ESM outputs in this version, which affected how we export the files from the package internally.

While this should have no effect on most apps, if you're directly importing a file from the package, its path will have changed.

Regular imports for package files remain unchanged.

```ts
// Before
import 'node_modules/@shopify/shopify-api/lib/clients/admin/graphql/client';
import '@shopify/shopify-api/adapters/node';

// After
// Add `dist/esm|cjs/` before the file
import 'node_modules/@shopify/shopify-api/dist/esm/lib/clients/admin/graphql/client';
// Unchanged
import '@shopify/shopify-api/adapters/node';
```
