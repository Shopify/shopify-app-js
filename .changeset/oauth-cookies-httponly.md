---
'@shopify/shopify-api': patch
---

Set the `HttpOnly` flag on cookies by default, including the OAuth state and session cookies, so browser JavaScript can no longer read them. Pass `httpOnly: false` to opt out. Boolean cookie attributes are now written as flags, so `secure=true` is now just `secure`.
