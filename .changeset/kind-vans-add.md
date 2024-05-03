---
"@shopify/shopify-api": patch
---

Added an `is_default` field to `CustomerAddress` so it doesn't overlap with the existing `default()` method we provide in the class.

Before:

```ts
const address = await shopify.rest.CustomerAddress.find({ session, id: 1234 });
// Boolean
console.log(address.default);
// Error - not a function
await address.default();
```

After:

```ts
const address = await shopify.rest.CustomerAddress.find({ session, id: 1234 });
// Boolean
console.log(address.is_default);
// Function
await address.default();
```

To prevent breaking existing apps, this only happens when the `customerAddressDefaultFix` flag is enabled.
