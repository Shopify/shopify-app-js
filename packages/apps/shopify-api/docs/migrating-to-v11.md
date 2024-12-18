# Migrating to V11

This document covers the changes apps will need to make to be able to upgrade to v11 of this package.

The main reason for this release was to remove support for Node 16 so we can continue to evolve this package, but we also took this opportunity to remove some deprecated features.

## Table of contents

To make it easier to navigate this guide, here is an overview of the sections it contains:

- Removing Node 16 support
- Add Node 22 support
- [Updates `CustomerAddress` REST Admin API](#updates-curstomeraddress-rest-admin-api)

---

## Updates `CustomerAddress` REST Admin API
Added an is_default field to CustomerAddress so it doesn't overlap with the existing default() method we provide in the class.

Before:
```ts
const address = await shopify.rest.CustomerAddress.find({session, id: 1234});
// Boolean
console.log(address.default);
// Error - not a function
await address.default();
```

After:
```ts
const address = await shopify.rest.CustomerAddress.find({session, id: 1234});
// Boolean
console.log(address.is_default);
// Function
await address.default();
```
