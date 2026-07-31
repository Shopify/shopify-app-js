---
'@shopify/graphql-client': major
---

Tighten the public GraphQL client types for better type safety and editor hints.

- `ResponseErrors.graphQLErrors` is now typed as `GraphQLError[]` (with `message`, `locations`, `path`, and `extensions`) instead of `any[]`. A new `GraphQLError` type is exported.
- `GQLExtensions` now describes the `cost`/`throttleStatus` shape while keeping a top-level index signature, so non-cost extension keys still work.
- `RequestOptions` fields are now `readonly`.

This is a breaking change: code that reads `graphQLErrors` or `extensions` as loosely typed values, or reassigns `RequestOptions` fields, may need updating.
