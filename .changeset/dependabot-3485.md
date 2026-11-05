---
'@shopify/api-codegen-preset': patch
'@shopify/shopify-app-session-storage-drizzle': patch
'@shopify/shopify-app-session-storage-mongodb': patch
'@shopify/shopify-app-session-storage-mysql': patch
'@shopify/shopify-app-session-storage-postgresql': patch
'@shopify/shopify-api': patch
'@shopify/shopify-app-react-router': patch
'@shopify/shopify-app-remix': patch
---

Updated `@parcel/watcher`, ` isbot`, ` lossless-json`, ` mongodb`, ` mysql2`, ` pg`, ` pg-connection-string` dependencies

Update `mongodb` to ^7.8.0 to fix CVE-2026-119179 and SRV host-name validation. MongoDB server 4.4 or newer is required. The driver no longer applies `timeoutMS` or `timeoutMode`; use per-stage timeouts instead.
