---
'@shopify/shopify-api': minor
'@shopify/shopify-app-remix': patch
---

Adding toggle parameter flag to return implied scopes from Remix API Query by returning original scopes from AuthScopes instantiation

Example:
const scopes = new AuthScopes(['read_customers', 'write_customers', 'read_products', 'write_channels']);
scopes.toArray() returns ['write_customers', 'read_products', 'write_channels']
scopes.toArray(true) returns ['read_customers', 'write_customers', 'read_products', 'write_channels']
