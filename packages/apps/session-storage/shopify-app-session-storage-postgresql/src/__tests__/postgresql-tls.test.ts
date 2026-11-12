import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import pg from 'pg';

import {PostgreSQLSessionStorage} from '../postgresql';

const dbURL = `postgres://${encodeURIComponent('shop&fy')}:${encodeURIComponent(
  'passify#$',
)}@db.example.com:5432/${encodeURIComponent('shop&test')}`;

describe('PostgreSQLSessionStorage TLS settings', () => {
  let poolConfigs: pg.PoolConfig[];

  beforeEach(() => {
    poolConfigs = [];
    jest.spyOn(pg, 'Pool').mockImplementation((config?: pg.PoolConfig) => {
      poolConfigs.push(config ?? {});
      return {
        query: jest.fn().mockResolvedValue({rows: [{}]}),
        end: jest.fn().mockResolvedValue(undefined),
      } as unknown as pg.Pool;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  async function poolConfigFor(
    storage: PostgreSQLSessionStorage,
  ): Promise<pg.PoolConfig> {
    await storage.ready;
    expect(poolConfigs).toHaveLength(1);
    return poolConfigs[0];
  }

  it('sets no TLS options when the database URL has none', async () => {
    const config = await poolConfigFor(new PostgreSQLSessionStorage(dbURL));

    expect(config).toEqual({
      host: 'db.example.com',
      user: 'shop&fy',
      password: 'passify#$',
      database: 'shop&test',
      port: 5432,
    });
    expect(config).not.toHaveProperty('ssl');
  });

  it('requires a verified TLS connection for sslmode=verify-full', async () => {
    const config = await poolConfigFor(
      new PostgreSQLSessionStorage(`${dbURL}?sslmode=verify-full`),
    );

    expect(config.ssl).toEqual({});
    expect(config.database).toBe('shop&test');
  });

  it('uses TLS for ssl=true', async () => {
    const config = await poolConfigFor(
      new PostgreSQLSessionStorage(new URL(`${dbURL}?ssl=true`)),
    );

    expect(config.ssl).toBe(true);
  });

  it('turns TLS off for sslmode=disable', async () => {
    const config = await poolConfigFor(
      new PostgreSQLSessionStorage(`${dbURL}?sslmode=disable`),
    );

    expect(config.ssl).toBe(false);
  });

  it('trusts the CA certificate that sslrootcert names', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pg-tls-'));
    const caPath = path.join(dir, 'root.crt');
    fs.writeFileSync(caPath, 'test CA certificate');

    try {
      const config = await poolConfigFor(
        new PostgreSQLSessionStorage(
          `${dbURL}?sslmode=verify-full&sslrootcert=${encodeURIComponent(caPath)}`,
        ),
      );

      expect(config.ssl).toEqual({ca: 'test CA certificate'});
    } finally {
      fs.rmSync(dir, {recursive: true, force: true});
    }
  });

  it('uses the ssl option over the TLS settings of the URL', async () => {
    const ssl = {rejectUnauthorized: true, ca: 'test CA certificate'};

    const config = await poolConfigFor(
      new PostgreSQLSessionStorage(`${dbURL}?sslmode=disable`, {ssl}),
    );

    expect(config.ssl).toEqual(ssl);
  });

  it('passes the ssl option from withCredentials', async () => {
    const config = await poolConfigFor(
      PostgreSQLSessionStorage.withCredentials(
        'db.example.com',
        'shop&test',
        'shop&fy',
        'passify#$',
        {ssl: true},
      ),
    );

    expect(config.ssl).toBe(true);
    expect(config.host).toBe('db.example.com');
  });
});
