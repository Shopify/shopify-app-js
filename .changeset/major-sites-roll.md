---
'@shopify/shopify-api': major
'@shopify/shopify-app-express': major
'@shopify/shopify-app-remix': minor
'@shopify/shopify-app-react-router': minor
---

**BREAKING CHANGE**: Removed `customShopDomains` configuration parameter. Use `domainTransformations` instead, which provides both validation and transformation capabilities.

The `SHOP_CUSTOM_DOMAIN` environment variable is no longer supported.

**Migration Guide**:

If you were using `customShopDomains` for validation only:

```typescript
// Before 
shopifyApi({
  customShopDomains: ['custom\.domain\.com']
})

// After 
shopifyApi({
  domainTransformations: [{
    match: /^([a-zA-Z0-9][a-zA-Z0-9-_]*)\.custom\.domain\.com$/,
    transform: '$1.custom.domain.com'
  }]
})
```
