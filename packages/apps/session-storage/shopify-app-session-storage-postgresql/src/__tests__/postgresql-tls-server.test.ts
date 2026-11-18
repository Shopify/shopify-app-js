import * as child_process from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {promisify} from 'util';

import pg from 'pg';
import {poll} from '@shopify/shopify-app-session-storage-test-utils';
import {Session} from '@shopify/shopify-api';

import {PostgreSQLSessionStorage} from '../postgresql';
import {PostgresConnection} from '../postgres-connection';

const execFile = promisify(child_process.execFile);

const port = 5436;
const user = 'shop&fy';
const password = 'passify#$';
const database = 'shop&tls';

// The server accepts TCP connections over TLS only (hostssl), so a client
// that connects in cleartext is refused instead of silently passing.
const serverScript = `set -e
dir=/var/lib/postgresql/tls
mkdir -p "$dir"
printf %s "$TLS_SERVER_CERT" | base64 -d > "$dir/server.crt"
printf %s "$TLS_SERVER_KEY" | base64 -d > "$dir/server.key"
printf 'local all all trust\\nhostssl all all all scram-sha-256\\n' > "$dir/pg_hba.conf"
chown -R postgres:postgres "$dir"
chmod 600 "$dir/server.key"
exec docker-entrypoint.sh postgres -c ssl=on \\
  -c "ssl_cert_file=$dir/server.crt" -c "ssl_key_file=$dir/server.key" \\
  -c "hba_file=$dir/pg_hba.conf"`;

function dbURL(host: string, params: Record<string, string>): string {
  const url = new URL(
    `postgres://${encodeURIComponent(user)}:${encodeURIComponent(
      password,
    )}@${host}:${port}/${encodeURIComponent(database)}`,
  );
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

async function createCertificates(dir: string): Promise<void> {
  const openssl = (args: string[]) => execFile('openssl', args, {cwd: dir});

  fs.writeFileSync(
    path.join(dir, 'openssl.cnf'),
    [
      '[req]',
      'distinguished_name = dn',
      '[dn]',
      '[ca]',
      'basicConstraints = critical, CA:TRUE',
      'keyUsage = critical, keyCertSign, cRLSign',
      '[server]',
      'subjectAltName = DNS:localhost',
      'extendedKeyUsage = serverAuth',
      '',
    ].join('\n'),
  );

  for (const name of ['ca', 'other-ca']) {
    await openssl([
      'req',
      '-x509',
      '-newkey',
      'rsa:2048',
      '-nodes',
      '-days',
      '2',
      '-subj',
      `/CN=Session storage test ${name}`,
      '-config',
      'openssl.cnf',
      '-extensions',
      'ca',
      '-keyout',
      `${name}.key`,
      '-out',
      `${name}.crt`,
    ]);
  }

  await openssl([
    'req',
    '-new',
    '-newkey',
    'rsa:2048',
    '-nodes',
    '-subj',
    '/CN=localhost',
    '-config',
    'openssl.cnf',
    '-keyout',
    'server.key',
    '-out',
    'server.csr',
  ]);
  await openssl([
    'x509',
    '-req',
    '-in',
    'server.csr',
    '-CA',
    'ca.crt',
    '-CAkey',
    'ca.key',
    '-CAcreateserial',
    '-days',
    '2',
    '-extfile',
    'openssl.cnf',
    '-extensions',
    'server',
    '-out',
    'server.crt',
  ]);
}

describe('PostgreSQLSessionStorage with a PostgreSQL server that requires TLS', () => {
  let dir: string;
  let caPath: string;
  let otherCaPath: string;
  let ca: string;
  let containerId: string | undefined;

  beforeAll(async () => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pg-tls-server-'));
    await createCertificates(dir);
    caPath = path.join(dir, 'ca.crt');
    otherCaPath = path.join(dir, 'other-ca.crt');
    ca = fs.readFileSync(caPath, 'utf8');

    const base64 = (file: string) =>
      fs.readFileSync(path.join(dir, file)).toString('base64');
    const run = await execFile('podman', [
      'run',
      '-d',
      '-e',
      `POSTGRES_DB=${database}`,
      '-e',
      `POSTGRES_USER=${user}`,
      '-e',
      `POSTGRES_PASSWORD=${password}`,
      '-e',
      `TLS_SERVER_CERT=${base64('server.crt')}`,
      '-e',
      `TLS_SERVER_KEY=${base64('server.key')}`,
      '-p',
      `${port}:5432`,
      'postgres:15',
      'bash',
      '-c',
      serverScript,
    ]);
    containerId = run.stdout.trim();

    try {
      await poll(
        async () => {
          const client = new pg.Client({
            host: 'localhost',
            port,
            user,
            password,
            database,
            ssl: {ca},
            connectionTimeoutMillis: 2000,
          });
          try {
            await client.connect();
            await client.query('SELECT 1');
            await client.end();
          } catch (_error) {
            return false;
          }
          return true;
        },
        {interval: 500, timeout: 80000},
      );
    } catch (error) {
      const logs = await execFile('podman', ['logs', containerId]).then(
        ({stdout, stderr}) => `${stdout}${stderr}`,
        (logsError) => String(logsError),
      );
      throw new Error(
        `The TLS PostgreSQL server did not start: ${error}\nContainer logs:\n${logs}`,
      );
    }
  });

  afterAll(async () => {
    if (containerId) await execFile('podman', ['rm', '-f', containerId]);
    if (dir) fs.rmSync(dir, {recursive: true, force: true});
  });

  async function expectSessionRoundTrip(
    storage: PostgreSQLSessionStorage,
    id: string,
  ): Promise<void> {
    const session = new Session({
      id,
      shop: 'tls-shop.myshopify.com',
      state: 'tls-state',
      isOnline: false,
      scope: 'fake_scope',
    });

    try {
      await storage.ready;
      expect(await storage.storeSession(session)).toBe(true);
      expect(await storage.loadSession(id)).toEqual(session);
      expect(await storage.deleteSession(id)).toBe(true);
    } finally {
      await storage.disconnect();
    }
  }

  // PostgresConnection is where the adapter builds its pg pool, so these
  // checks read the connection error from it directly.
  async function expectConnectionRefused(
    url: string,
    error: Record<string, string>,
  ): Promise<void> {
    const connection = new PostgresConnection(url, 'shopify_sessions');
    try {
      await expect(connection.query('SELECT 1')).rejects.toMatchObject(error);
    } finally {
      await connection.disconnect();
    }
  }

  it('stores and loads a session with sslmode=verify-full and sslrootcert in the URL', async () => {
    await expectSessionRoundTrip(
      new PostgreSQLSessionStorage(
        dbURL('localhost', {sslmode: 'verify-full', sslrootcert: caPath}),
      ),
      'tls-url-session',
    );
  });

  it('stores and loads a session with withCredentials and the ssl option', async () => {
    await expectSessionRoundTrip(
      PostgreSQLSessionStorage.withCredentials(
        `localhost:${port}`,
        database,
        user,
        password,
        {ssl: {ca}},
      ),
      'tls-option-session',
    );
  });

  it('refuses a server certificate that the trusted CA did not sign', async () => {
    await expectConnectionRefused(
      dbURL('localhost', {sslmode: 'verify-full', sslrootcert: otherCaPath}),
      {code: 'UNABLE_TO_VERIFY_LEAF_SIGNATURE'},
    );
  });

  it('refuses a server certificate for another host name', async () => {
    await expectConnectionRefused(
      dbURL('127.0.0.1', {sslmode: 'verify-full', sslrootcert: caPath}),
      {code: 'ERR_TLS_CERT_ALTNAME_INVALID'},
    );
  });

  it('is refused by the server when the URL turns TLS off', async () => {
    await expectConnectionRefused(dbURL('localhost', {sslmode: 'disable'}), {
      code: '28000',
    });
  });
});
