# Session Storage Adapter for PostgreSQL

This package implements the `SessionStorage` interface that works with an instance of [PostgreSQL](https://www.postgresql.org).
Tested using PostgreSQL v15

## Basic Usage

```js
import {shopifyApp} from '@shopify/shopify-app-express';
import {PostgreSQLSessionStorage} from '@shopify/shopify-app-session-storage-postgresql';

const shopify = shopifyApp({
  sessionStorage: new PostgreSQLSessionStorage(
    'postgres://username:password@host/database',
  ),
  // ...
});

// OR

const shopify = shopifyApp({
  sessionStorage: new PostgreSQLSessionStorage(
    new URL('postgres://username:password@host/database'),
  ),
  // ...
});

// OR

const shopify = shopifyApp({
  sessionStorage: PostgreSQLSessionStorage.withCredentials(
    'host.com',
    'thedatabase',
    'username',
    'password',
  ),
  // ...
});
```

## SSL Configuration

For databases that require SSL connections (such as AWS RDS, Google Cloud SQL, or other cloud-hosted PostgreSQL instances), you can provide SSL configuration options:

```js
import {shopifyApp} from '@shopify/shopify-app-express';
import {PostgreSQLSessionStorage} from '@shopify/shopify-app-session-storage-postgresql';
import fs from 'fs';

// Basic SSL configuration (reject unauthorized connections)
const shopify = shopifyApp({
  sessionStorage: new PostgreSQLSessionStorage(
    'postgres://username:password@host/database',
    {
      ssl: {
        rejectUnauthorized: true,
      },
    },
  ),
  // ...
});

// SSL with custom certificates (e.g., for AWS RDS)
const shopify = shopifyApp({
  sessionStorage: new PostgreSQLSessionStorage(
    'postgres://username:password@host/database',
    {
      ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync('/path/to/ca-certificate.crt').toString(),
        cert: fs.readFileSync('/path/to/client-cert.crt').toString(),
        key: fs.readFileSync('/path/to/client-key.key').toString(),
      },
    },
  ),
  // ...
});

// Using withCredentials with SSL
const shopify = shopifyApp({
  sessionStorage: PostgreSQLSessionStorage.withCredentials(
    'your-rds-endpoint.amazonaws.com',
    'your-database',
    'username',
    'password',
    {
      ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync('/path/to/rds-ca-2019-root.pem').toString(),
      },
    },
  ),
  // ...
});
```

### SSL Configuration Options

The `ssl` option accepts any valid [node-postgres SSL configuration](https://node-postgres.com/features/ssl):

- `rejectUnauthorized`: boolean - If true, the server certificate is verified against the list of supplied CAs
- `ca`: string | Buffer - Certificate Authority certificate(s)
- `cert`: string | Buffer - Client certificate
- `key`: string | Buffer - Client private key
- `passphrase`: string - Passphrase for the private key
- `servername`: string - Server name for SNI (Server Name Indication)

### AWS RDS Example

For AWS RDS PostgreSQL instances, you typically need to download the RDS CA certificate:

```bash
# Download the RDS CA certificate
curl -o rds-ca-2019-root.pem https://s3.amazonaws.com/rds-downloads/rds-ca-2019-root.pem
```

Then use it in your configuration:

```js
const shopify = shopifyApp({
  sessionStorage: new PostgreSQLSessionStorage(
    'postgres://username:password@your-rds-endpoint.amazonaws.com:5432/database',
    {
      ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync('./rds-ca-2019-root.pem').toString(),
      },
    },
  ),
  // ...
});
```

If you prefer to use your own implementation of a session storage mechanism that is compatible with the `@shopify/shopify-app-express` package, see the [implementing session storage guide](../shopify-app-session-storage/implementing-session-storage.md).
