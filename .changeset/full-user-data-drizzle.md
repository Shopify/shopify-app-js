---
'@shopify/shopify-app-session-storage-drizzle': patch
---

Enable the full user info test in `batteryOfTests`. The Drizzle adapter has always stored the complete user object correctly via its column-mapped schema; this change simply exercises that path in the standard test suite.
