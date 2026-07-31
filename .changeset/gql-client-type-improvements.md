---
'@shopify/graphql-client': major
'@shopify/admin-api-client': major
'@shopify/storefront-api-client': major
'@shopify/shopify-api': major
---

Tighten the public GraphQL client types for better type safety and editor hints.

- `ResponseErrors.graphQLErrors` is now typed as `GraphQLError[]` (with `message`, `locations`, `path`, and `extensions`) instead of `any[]`. A new `GraphQLError` type is exported.
- `GQLExtensions` now describes the `cost`/`throttleStatus` shape while keeping a top-level index signature, so non-cost extension keys still work.
- `RequestOptions` fields are now `readonly`.

These types are re-exported by `@shopify/admin-api-client`, `@shopify/storefront-api-client`, and `@shopify/shopify-api`, so the change flows through to those packages too.

This is technically a breaking change because previously-`any` values are now more specific. In practice it is very unlikely to affect an app in any meaningful way: existing code keeps working, and most callers only gain better autocomplete and type checking.
