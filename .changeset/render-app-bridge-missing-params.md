---
'@shopify/shopify-app-react-router': patch
---

Fixed an issue where embedded apps would incorrectly show the login page when
`shop` or `host` query params were missing from a document request (e.g. after
SPA navigation followed by a full page reload during local development).

Instead of redirecting to the login path, the server now renders a minimal App
Bridge page. App Bridge detects it is still embedded in the Shopify admin iframe,
retrieves the session token from the parent frame, and re-authenticates
seamlessly — no user interaction required.

This is a non-breaking change. The previous login redirect was effectively dead
code for embedded apps (`isEmbeddedApp` is always `true` for apps using this
library; the `ShopifyAdmin` distribution is excluded earlier in the pipeline).
No public APIs are added, removed, or changed.

Additionally hardened `renderAppBridge` to sanitize the `shop` query param
before using it in response headers, so an invalid/attacker-controlled value
cannot be reflected into the `Content-Security-Policy: frame-ancestors` or
`Link` preconnect headers.
