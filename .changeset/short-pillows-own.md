---
"@shopify/shopify-api": patch
---

Fixing REST resource `find()` methods to fail when missing all ids, instead of defaulting to the same behaviour as `all()`.
