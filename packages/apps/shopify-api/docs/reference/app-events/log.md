# shopify.appEvents.log

Sends one [App Event](https://shopify.dev/docs/api/app-events/latest) to Shopify from your server. The SDK authenticates with the app's client ID and client secret, so no shop session is required.

The app must be installed on the shop. To obtain `shopId`, query `{ shop { id } }` through the Admin API. The SDK does not resolve a shop domain to its ID.

App Events is served by the Global API. Set `globalApiVersion` to choose the Global API version; it defaults to `GlobalApiVersion.July26` and is independent from the Admin API `apiVersion`.

## Examples

### Node.js

```ts
const result = await shopify.appEvents.log({
  shopId: 'gid://shopify/Shop/23423423',
  eventHandle: 'onboarding_completed',
  idempotencyKey: 'onboard_23423423_v3',
  attributes: {onboarding_version: 3},
});

console.log(result.replayed);
```

## Parameters

### shopId

`string | number | bigint` | :exclamation: required

The numeric shop ID or a Shopify Shop GID. The SDK sends the numeric ID as a string.

### eventHandle

`string` | :exclamation: required

The non-empty handle that identifies the event.

For a billing event, this must match a meter handle in the app's pricing configuration.

### idempotencyKey

`string` | :exclamation: required

A non-empty key of at most 64 characters. Reuse the same key when you retry one event.

The key must be unique across all of the app's shops. Shopify scopes its idempotency cache by app and key, not by shop.

### attributes

`Record<string, string | number | boolean>` | :exclamation: required

Up to 15 flat attributes. Keys may contain letters, numbers, underscores, periods, and hyphens, and may be at most 64 characters. String values may be at most 128 characters.

The App Events API requires this field, so pass `{}` when the event carries no data. The SDK drops keys whose value is `undefined`.

For a billing event, `attributes.value` sets the quantity applied to the meter.

### timestamp

`Date`

The event time. Defaults to the current time. It must not be more than 5 minutes in the future.

## Return

`Promise<AppEventLogResult>`

Returns `{replayed: boolean}`. `replayed` is true when Shopify returns a cached response for the idempotency key.

## Errors

`InvalidAppEventError` when the event fails local validation. The SDK throws before making an HTTP request.

`HttpThrottlingError` when Shopify returns 429. Read `error.response.retryAfter` for the delay in seconds.

`HttpResponseError` for other rejections, including 400, 401, 403, and 409. The message includes the `error` and `errors` fields that Shopify returned.

A `202` response means Shopify accepted the request. It does not confirm that billing or analytics validation passed; those run asynchronously and surface in the Dev Dashboard logs.

[Back to shopify.appEvents](./README.md)
