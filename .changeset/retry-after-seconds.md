---
'@shopify/graphql-client': patch
---

Read the `Retry-After` header as seconds, or as an HTTP date, when retrying a 429 or 503 response. It was read as milliseconds, so a client asked to wait 2 seconds retried after 2 ms, and an HTTP date made it retry at once.
