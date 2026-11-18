---
'@shopify/shopify-app-session-storage-postgresql': major
---

Apply the TLS settings of the database URL to the PostgreSQL connection, and add an `ssl` option that is passed to `pg`. Before this change, the adapter ignored `sslmode`, `ssl`, `sslrootcert`, `sslcert` and `sslkey` in the URL. It connected without TLS unless the `PGSSLMODE` environment variable was set.

## Who is affected

Only apps whose database URL has TLS settings. A URL without them connects as before.

- A URL with `sslmode=require`, `sslmode=prefer`, `sslmode=verify-ca`, `sslmode=verify-full` or `ssl=true` now connects over TLS and checks the server's certificate and host name. `pg` 8 treats all four `sslmode` values as `verify-full`. The connection fails if the server does not support TLS, or if a CA that Node trusts did not sign the certificate. This is common with providers that sign with their own CA, and with self-signed certificates.
- A URL with `sslrootcert`, `sslcert` or `sslkey` now reads those files. The connection fails if a file does not exist.
- When the URL has TLS settings, they replace the `PGSSLMODE` environment variable, as they do in `pg`. For example, `sslmode=require` in the URL with `PGSSLMODE=no-verify` now checks the certificate.

## What to change

- If your provider signs the certificate with its own CA, give that CA. Add `sslrootcert=<path to the CA file>` to the URL, or pass the CA in the `ssl` option:

  ```ts
  const sessionStorage = new PostgreSQLSessionStorage(
    'postgres://username:password@host/database',
    {ssl: {ca: process.env.DATABASE_CA_CERT}},
  );
  ```

- If your database server does not support TLS, remove the TLS settings from the URL. Do this only for a server on a network you trust.
