---
'@shopify/shopify-app-session-storage-postgresql': minor
---

Add Unix socket connection support by using pg-connection-string to parse connection URLs instead of manual URL decomposition. This enables connecting via Unix domain sockets (e.g. Google Cloud SQL Auth Proxy) using the standard `?host=` query parameter, and also preserves SSL and other connection parameters that were previously dropped.
