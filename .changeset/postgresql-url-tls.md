---
'@shopify/shopify-app-session-storage-postgresql': major
---

Apply the TLS settings of the database URL to the PostgreSQL connection, add an `ssl` option that is passed to `pg`, and require verified TLS in production. Before this change, the adapter ignored `sslmode`, `ssl`, `sslrootcert`, `sslcert` and `sslkey` in the URL. It connected without TLS unless the `PGSSLMODE` environment variable was set.

## Who is affected

- **Apps that run with `NODE_ENV=production` and connect without verified TLS.** `PostgreSQLSessionStorage` now throws when you create it, unless TLS that checks the server's certificate and host name is on. Only the TLS setting that applies counts: the `ssl` option, else the TLS settings of the URL, else `PGSSLMODE`. The storage refuses a setting that is missing or turns TLS off, for example `sslmode=disable` or `ssl: false`. It also refuses `sslmode=no-verify`, `uselibpqcompat=true` with `sslmode=require`, `prefer` or `verify-ca`, and `rejectUnauthorized: false`. `withCredentials` without the `ssl` option is refused too, unless `PGSSLMODE` turns on verified TLS.
- **Apps whose database URL has TLS settings, in every environment.** A URL with `sslmode=require`, `sslmode=prefer`, `sslmode=allow`, `sslmode=verify-ca`, `sslmode=verify-full` or `ssl=true` now connects over TLS and checks the server's certificate and host name. `pg` 8 treats all these `sslmode` values as `verify-full`. The connection fails if the server does not support TLS, or if a CA that Node trusts did not sign the certificate. This is common with providers that sign with their own CA, and with self-signed certificates.
- A URL with `sslrootcert`, `sslcert` or `sslkey` now reads those files. The connection fails if a file does not exist.
- An `sslmode`, `ssl=true` or `sslrootcert` in the URL replaces the `PGSSLMODE` environment variable, as it does in `pg`. For example, `sslmode=require` in the URL with `PGSSLMODE=no-verify` now checks the certificate.

Outside production, a URL without TLS settings connects as before.

## What to change

- In production, add `sslmode=verify-full` to the database URL, or pass the `ssl` option.
- If your provider signs the certificate with its own CA, give that CA. Add `sslrootcert=<path to the CA file>` to the URL, or pass the CA in the `ssl` option:

  ```ts
  const sessionStorage = new PostgreSQLSessionStorage(
    'postgres://username:password@host/database',
    {ssl: {ca: process.env.DATABASE_CA_CERT}},
  );
  ```

- If your database server cannot use TLS: in production, and only on a network you trust, pass `{allowInsecureConnection: true}`. Outside production, remove the TLS settings from the URL.
