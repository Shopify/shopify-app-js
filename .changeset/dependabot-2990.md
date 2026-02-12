---
'@shopify/shopify-app-express': major
'@shopify/shopify-api': patch
---

Updated `express` from v4 to v5 and `@types/express` from v4 to v5.

**Breaking changes for consumers of `@shopify/shopify-app-express`:**

- `express` has been moved from `dependencies` to `peerDependencies`. You must install `express@^5.0.0` directly in your project.
- Express 5 requires Node.js >= 18 (this package already requires >= 20).
- If you use wildcard route patterns, update them for Express 5 syntax. `app.use()` already matches all subpaths, so the `/*` suffix is unnecessary:
  - `app.use('/api/*', ...)` → `app.use('/api', ...)`
  - `app.use('/*', ...)` → `app.use('/', ...)`
  - For `app.get`/`app.post` routes, wildcards must be named: `app.get('/api/*path', ...)`
- `req.body` now defaults to `undefined` (was `{}` in v4) when no body-parser middleware is applied. Ensure you use `express.json()`, `express.text()`, or similar middleware before accessing `req.body`.
- `req.query` is now read-only and uses the `querystring` parser by default instead of `qs`. Nested object query parameters are no longer parsed by default.
- See the [Express 5 migration guide](https://expressjs.com/en/guide/migrating-5.html) for the full list of changes.

Added a null guard in `graphqlProxy` to handle `req.body` being `undefined`.
