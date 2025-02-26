---
'@shopify/shopify-api': minor
---

Add optional param with default to add buffer to session token active check

Now by default a session will be considered non active if it is within 500ms of expiry.
