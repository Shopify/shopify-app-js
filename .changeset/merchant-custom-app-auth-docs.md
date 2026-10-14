---
'@shopify/shopify-app-react-router': patch
---

Document that `authenticate.admin` does not authenticate requests for merchant custom apps (`AppDistribution.ShopifyAdmin`).

Merchant custom apps can't be embedded in the Shopify admin, so their requests don't carry a session token. For these apps, `authenticate.admin` returns an Admin API context that uses the configured `adminApiAccessToken` for any request it receives. Your app must authenticate its own users before it calls `authenticate.admin`, for example with your identity provider, a private network, or HTTP authentication. This change updates documentation only; runtime behavior is unchanged.
