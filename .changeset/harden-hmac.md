---
'@shopify/shopify-api': major
'@shopify/shopify-app-remix': major
'@shopify/shopify-app-express': major
---

Harden App Proxy validation.

As a result of this change An OAuth callback route can throw different errors for invalid URLs.  This is technically a breaking change, but it's unlikely consumers are affected by this.  
