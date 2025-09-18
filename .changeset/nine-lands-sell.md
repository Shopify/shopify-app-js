---
'@shopify/shopify-app-react-router': minor
---

Instruct the browser to preload the Polaris Web components script.  This should aid performance since:

- The download can start sooner
- The download can happen in paralell with other requests
- The download may have completed by the time Polaris web components are parsed by the browser
