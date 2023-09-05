---
'@shopify/shopify-app-remix': patch
---

Fixed an issue when running the app behind a reverse proxy that rewrites the `Host` header, where the bounce flow redirect (to ensure the id_token search param is present) relied on the incoming request URL and pointed to the internal host rather than the external one.
