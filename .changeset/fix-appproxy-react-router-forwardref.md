---
'@shopify/shopify-app-react-router': patch
---

`AppProxyLink` now uses `forwardRef`, allowing consumers to attach a ref to the
underlying `<a>` element (e.g. `anchor.current.focus()`).
