---
'@shopify/shopify-app-react-router': patch
'@shopify/shopify-app-remix': patch
---

Fixed an issue where `authenticate.admin(request).redirect(...)` could propagate embedded request parameters (including the session token) to a cross-origin destination when given a protocol-relative or backslash-prefixed URL. The same-origin check now uses the resolved URL's origin rather than a lexical prefix match, so only genuine same-origin redirects inherit request parameters.
