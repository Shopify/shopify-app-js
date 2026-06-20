---
'@shopify/shopify-api': minor
---

Add `cookiePath` config option for multi-shop non-embedded apps

Non-embedded apps that need to support multiple shops simultaneously in
separate browser tabs were affected by a cookie collision: all shops shared
a single `shopify_app_session` cookie at `path=/`, so authenticating a new
shop would silently overwrite the previous shop's session.

The new optional `cookiePath` config option lets you scope the session
cookie to a shop-specific URL prefix, so each shop's cookie coexists
independently in the browser.

```ts
// Static path (default behaviour, unchanged)
cookiePath: '/'

// Factory function — recommended for multi-shop apps
cookiePath: (session) => `/shops/${session.shop}/`
```

**Requirement:** the configured path must match your app's URL structure.
Each shop must be served under a distinct URL prefix for the browser to
deliver the correct cookie per request.
