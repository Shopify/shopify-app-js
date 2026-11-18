---
'@shopify/shopify-app-session-storage-mongodb': major
---

Require TLS for the MongoDB connection in production. When `NODE_ENV` is `production`, `MongoDBSessionStorage` now throws unless the URL uses `mongodb+srv://`, `tls=true` or `ssl=true`, and does not set `tlsInsecure`, `tlsAllowInvalidCertificates` or `tlsAllowInvalidHostnames`. `withCredentials` now adds `tls=true` to the URL it builds, in every environment. To keep connecting without TLS to a server on a network you trust, pass `{allowInsecureConnection: true}`. With `withCredentials`, this option also leaves `tls=true` out of the URL.
