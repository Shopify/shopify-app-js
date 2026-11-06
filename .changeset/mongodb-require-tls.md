---
'@shopify/shopify-app-session-storage-mongodb': major
---

Require TLS for the MongoDB connection in production. When `NODE_ENV` is `production`, `MongoDBSessionStorage` now throws unless the URL uses `mongodb+srv://` or `tls=true`, and does not set `tlsInsecure`, `tlsAllowInvalidCertificates` or `tlsAllowInvalidHostnames`. `withCredentials` now adds `tls=true` to the URL it builds. To keep connecting without TLS to a server on a network you trust, pass `{allowInsecureConnection: true}`.
