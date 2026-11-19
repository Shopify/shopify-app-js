---
'@shopify/shopify-app-session-storage-mongodb': major
---

Require TLS for the MongoDB connection in production.

## Who is affected

- Apps where `NODE_ENV` is `production` and the URL does not use `mongodb+srv://`, `tls=true` or `ssl=true`. `MongoDBSessionStorage` now throws when you create it.
- Apps where `NODE_ENV` is `production` and the URL sets `tlsInsecure`, `tlsAllowInvalidCertificates` or `tlsAllowInvalidHostnames`. These now throw too.
- Apps that use `withCredentials`. The URL it builds now has `tls=true` in every environment, so a server without TLS refuses the connection.

## What to change

- Add `tls=true` to the URL, or use a `mongodb+srv://` URL. Remove the options that turn off certificate checks.
- To keep connecting without TLS to a server on a network you trust, pass `{allowInsecureConnection: true}`. With `withCredentials`, this option also leaves `tls=true` out of the URL.
