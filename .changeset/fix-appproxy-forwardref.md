---
'@shopify/shopify-app-remix': patch
'@shopify/shopify-app-react-router': patch
---

Forward refs in AppProxyForm and AppProxyLink components

`AppProxyForm` and `AppProxyLink` now use `forwardRef`, allowing consumers to
attach a ref to the underlying DOM element (e.g. `form.current.submit()`).
