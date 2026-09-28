---
'@shopify/shopify-app-react-router': patch
'@shopify/shopify-app-remix': patch
---

Restrict where `authenticate.admin` follows exit-iframe redirects. The destination may now only be the app's own origin (including relative paths) or the Shopify admin (`admin.shopify.com`, and `<shop>.myshopify.com` under `/admin`), over https with no custom port. Other destinations are refused. Apps that passed their own external URL to the exit-iframe endpoint should use `redirect(url, { target: '_top' })` instead.
