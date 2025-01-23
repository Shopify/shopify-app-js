---
'@shopify/shopify-app-session-storage-prisma': patch
---

Revert update to prisma dependencies

In version 5.2.2 of this package the `prisma` peer dependency was updated to `^6.0.0`. 
This update reverts that change, to remove the breaking change.
