---
'@shopify/shopify-app-remix': patch
---

Fix type error. Previosuly authenticate.appProxy() was typed as if it could return an object without session and admin properties. This was incorrect. Those properties will always exist, they may just be undefined.
