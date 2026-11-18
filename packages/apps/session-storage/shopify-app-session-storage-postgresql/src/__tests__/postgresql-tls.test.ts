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

  describe('in production', () => {
    const originalEnv = {
      NODE_ENV: process.env.NODE_ENV,
      PGSSLMODE: process.env.PGSSLMODE,
    };

    beforeEach(() => {
      process.env.NODE_ENV = 'production';
      delete process.env.PGSSLMODE;
    });

    afterEach(() => {
      for (const [name, value] of Object.entries(originalEnv)) {
        if (value === undefined) {
          delete process.env[name];
        } else {
          process.env[name] = value;
        }
      }
    });

    it.each([
      ['no TLS settings', dbURL, {}],
      ['sslmode=disable', `${dbURL}?sslmode=disable`, {}],
      ['sslmode=no-verify', `${dbURL}?sslmode=no-verify`, {}],
      ['ssl=0', `${dbURL}?ssl=0`, {}],
      ['ssl=no-verify', `${dbURL}?ssl=no-verify`, {}],
      [
        'uselibpqcompat=true&sslmode=require',
        `${dbURL}?uselibpqcompat=true&sslmode=require`,
        {},
      ],
      [
        'uselibpqcompat=true&sslmode=prefer',
        `${dbURL}?uselibpqcompat=true&sslmode=prefer`,
        {},
      ],
      [
        'the ssl option with rejectUnauthorized: false',
        `${dbURL}?sslmode=verify-full`,
        {ssl: {rejectUnauthorized: false}},
      ],
      [
        'the ssl option set to false',
        `${dbURL}?sslmode=verify-full`,
        {ssl: false},
      ],
    ])('refuses %s', (_name, url, opts) => {
      expect(() => new PostgreSQLSessionStorage(url, opts)).toThrow(
        /requires TLS/,
      );
      expect(poolConfigs).toHaveLength(0);
    });

    it.each(['require', 'verify-ca'])(
      'refuses uselibpqcompat=true&sslmode=%s with sslrootcert, which skips the host name check',
      (sslmode) => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pg-tls-'));
        const caPath = path.join(dir, 'root.crt');
        fs.writeFileSync(caPath, 'test CA certificate');

        try {
          expect(
            () =>
              new PostgreSQLSessionStorage(
                `${dbURL}?uselibpqcompat=true&sslmode=${sslmode}&sslrootcert=${encodeURIComponent(caPath)}`,
              ),
          ).toThrow(/requires TLS/);
        } finally {
          fs.rmSync(dir, {recursive: true, force: true});
        }
      },
    );

    it('refuses withCredentials without the ssl option', () => {
      expect(() =>
        PostgreSQLSessionStorage.withCredentials(
          'db.example.com',
          'shop&test',
          'shop&fy',
          'passify#$',
          {},
        ),
      ).toThrow(/requires TLS/);
    });

    it('refuses PGSSLMODE=no-verify for a URL without TLS settings', () => {
      process.env.PGSSLMODE = 'no-verify';

      expect(() => new PostgreSQLSessionStorage(dbURL)).toThrow(/requires TLS/);
    });

    it.each([
      ['sslmode=verify-full', `${dbURL}?sslmode=verify-full`, {}],
      ['sslmode=verify-ca', `${dbURL}?sslmode=verify-ca`, {}],
      ['sslmode=require', `${dbURL}?sslmode=require`, {}],
      ['sslmode=prefer', `${dbURL}?sslmode=prefer`, {}],
      ['sslmode=allow', `${dbURL}?sslmode=allow`, {}],
      ['ssl=true', `${dbURL}?ssl=true`, {}],
      ['the ssl option', dbURL, {ssl: {ca: 'test CA certificate'}}],
      [
        'the ssl option over sslmode=disable in the URL',
        `${dbURL}?sslmode=disable`,
        {ssl: {ca: 'test CA certificate'}},
      ],
      [
        'allowInsecureConnection',
        `${dbURL}?sslmode=disable`,
        {allowInsecureConnection: true},
      ],
    ])('connects with %s', async (_name, url, opts) => {
      await expect(
        new PostgreSQLSessionStorage(url, opts).ready,
      ).resolves.toBeUndefined();
      expect(poolConfigs).toHaveLength(1);
    });

    it('connects with sslmode=verify-full in the URL over PGSSLMODE=disable', async () => {
      process.env.PGSSLMODE = 'disable';

      await expect(
        new PostgreSQLSessionStorage(`${dbURL}?sslmode=verify-full`).ready,
      ).resolves.toBeUndefined();
    });

    it('connects with PGSSLMODE=verify-full for a URL without TLS settings', async () => {
      process.env.PGSSLMODE = 'verify-full';

      await expect(
        new PostgreSQLSessionStorage(dbURL).ready,
      ).resolves.toBeUndefined();
    });

    it('connects with withCredentials and the ssl option', async () => {
      const config = await poolConfigFor(
        PostgreSQLSessionStorage.withCredentials(
          'db.example.com',
          'shop&test',
          'shop&fy',
          'passify#$',
          {ssl: {ca: 'test CA certificate'}},
        ),
      );

      expect(config.ssl).toEqual({ca: 'test CA certificate'});
    });
  });

  it('connects without TLS outside production', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    try {
      const config = await poolConfigFor(new PostgreSQLSessionStorage(dbURL));
      expect(config).not.toHaveProperty('ssl');
    } finally {
      if (originalNodeEnv === undefined) {
        delete process.env.NODE_ENV;
      } else {
        process.env.NODE_ENV = originalNodeEnv;
      }
    }
  });
});
