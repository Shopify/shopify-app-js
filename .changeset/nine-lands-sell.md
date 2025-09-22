---
'@shopify/shopify-app-react-router': minor
---

When responding to Admin document requests add document response headers instructing the browser to:

1. Preconnect to the Shopify CDN
2. Preload Polaris and App Bridge

This helps performance because the download of critical resources can start sooner and any assets these resources dynamically download will start with a warm connection pool.
