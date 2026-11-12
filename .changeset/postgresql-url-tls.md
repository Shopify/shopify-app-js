---
'@shopify/shopify-app-session-storage-postgresql': minor
---

Apply the TLS settings of the database URL (`sslmode`, `ssl`, `sslrootcert`, `sslcert`, `sslkey`) to the PostgreSQL connection, and add an `ssl` option that is passed to `pg`. Before this change, the adapter ignored those settings and connected without TLS. A URL that sets `sslmode` (other than `disable` or `no-verify`) now checks the server's certificate, so the connection fails when the certificate does not validate: give the CA with `sslrootcert` or the `ssl` option.
