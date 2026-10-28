---
'@shopify/shopify-app-react-router': patch
'@shopify/shopify-app-remix': patch
---

Fix broken code examples in the reference docs. Examples now parse and match the package APIs: removed stray parentheses and fixed unbalanced braces, declared variables before using them (`session`, `topic`), added missing `await`s on `authenticate.*`, `admin.graphql` and `shopify.login`, and added missing imports (`GraphqlQueryError`, `unauthenticated`, loader/action types and React hooks). React Router examples no longer import `json`, which React Router v7 doesn't export: loaders and actions return plain objects, use `data()` to set a status, and use `Response.json()` for responses passed to `cors()`. This change updates documentation only; runtime behavior is unchanged.
