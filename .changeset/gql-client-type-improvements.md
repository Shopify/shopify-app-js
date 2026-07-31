---
'@shopify/graphql-client': major
'@shopify/admin-api-client': major
'@shopify/storefront-api-client': major
'@shopify/shopify-api': major
---

Tighten the public GraphQL client types for better type safety and editor hints.

- `ResponseErrors.graphQLErrors` is now typed as `GraphQLError[]` (with `message`, `locations`, `path`, and error `extensions`) instead of `any[]`. A new `GraphQLError` type is exported.
- `GQLExtensions` now documents the Admin `cost`/`throttleStatus` and Storefront `context` shapes, while keeping a permissive index signature so any other extension key still works.
- `RequestOptions` fields are now `readonly`.

These types are re-exported by `@shopify/admin-api-client`, `@shopify/storefront-api-client`, and `@shopify/shopify-api`, so the change flows through to those packages too.

This is marked as a major out of caution, but it is very unlikely to affect an app in a meaningful way: the extension types keep a permissive index signature, so existing property access keeps working, and most callers only gain better autocomplete. The main things a strict compiler could flag are reassigning `readonly` `RequestOptions` fields, or reading non-standard properties off a `graphQLErrors` entry.
