---
'@shopify/graphql-client': patch
---

Add error handling to createJsonResponseAsyncIterator so that response.json() failures in the streaming JSON path return a structured error response instead of throwing an unhandled exception.
