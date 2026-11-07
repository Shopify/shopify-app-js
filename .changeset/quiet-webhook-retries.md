---
'@shopify/shopify-app-react-router': patch
'@shopify/shopify-app-remix': patch
---

Limit sessionless webhook handling of failed token refreshes to unusable refresh tokens. Preserve temporary refresh and session storage errors so deliveries can be retried.
