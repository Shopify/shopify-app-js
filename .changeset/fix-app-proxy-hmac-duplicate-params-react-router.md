---
'@shopify/shopify-app-react-router': patch
---

Fix app proxy HMAC validation failing when a URL query parameter appears more than once. `Object.fromEntries` was silently dropping duplicate keys before HMAC validation, producing a different string than Shopify signed. The fix preserves all values for repeated parameters and joins them with commas, matching Shopify's signing behaviour.
