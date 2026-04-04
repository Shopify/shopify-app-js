---
'@shopify/shopify-app-remix': patch
---

`AppProxyForm` and `AppProxyLink` now use `forwardRef`, allowing consumers to
attach a ref to the underlying DOM element (e.g. `form.current.submit()`).
