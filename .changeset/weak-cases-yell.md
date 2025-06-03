---
'@shopify/shopify-api': patch
---

Log HTTP Response objects

Resolves a bug where HTTP Response objects were not being logged correctly. Now when `httpRequests` is enabled, the response object is logged as a plain object.

```
// shopify.server
shopifyApp(
...
logger: {
    httpRequests: true,
});
```
