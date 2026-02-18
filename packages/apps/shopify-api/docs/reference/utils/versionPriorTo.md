# shopify.utils.versionPriorTo

This method determines if the given version is older than the configured `apiVersion` for the `shopifyApi` object.
Its main use is when you want to tweak behaviour depending on your current API version, though apps won't typically need this kind of check.

## Example

```ts
const shopify = shopifyApi({
  apiVersion: ApiVersion.July25,
});

if (shopify.utils.versionPriorTo(ApiVersion.July25)) {
  // false in this example, as both versions are July25
}
if (shopify.utils.versionPriorTo(ApiVersion.October25)) {
  // true in this example, as ApiVersion.October25 is newer than ApiVersion.July25, i.e. the configured version is older
  // than the reference one
}
```

## Parameters

### apiVersion

`ApiVersion` | :exclamation: required

The API version to check against.

## Return

`boolean`

Whether the reference version is older than the configured version.

[Back to shopify.utils](./README.md)
