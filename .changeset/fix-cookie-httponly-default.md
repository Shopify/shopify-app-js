---
'@shopify/shopify-api': patch
---

Set `httpOnly` by default when writing cookies

`Cookies.set` (and therefore `Cookies.setAndSign`) now applies `httpOnly: true`
by default, matching the long-standing `CookieData.httpOnly` JSDoc which already
documented `true` as the default. Previously the default was never applied, so
the OAuth `shopify_app_state` cookie (and the non-embedded session cookie) were
emitted without the `HttpOnly` flag. Callers that need client-side JavaScript
access can still opt out by explicitly passing `httpOnly: false`.
