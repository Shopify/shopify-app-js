---
'@shopify/shopify-app-session-storage-memory': patch
---

Enable the full user info test in `batteryOfTests`. The memory adapter has always stored the complete user object correctly; this change simply exercises that path in the standard test suite.
