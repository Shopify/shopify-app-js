---
"@shopify/shopify-api": patch
---

Added an `is_default` field to `CustomerAddress` so it doesn't overlap with the existing `default()` method we provide in the class.
