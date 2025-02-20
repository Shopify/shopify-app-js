---
'@shopify/shopify-app-remix': patch
---
# Don't retry extension requests with invalid session tokens

Requests from the embedded app admin UI are not retried when the session token is invalid. This is done with the special app bridge header `x-shopify-session-token-retry-request`.

Requests from extensions cannot be retried, so we are no longer adding this header to the response.
