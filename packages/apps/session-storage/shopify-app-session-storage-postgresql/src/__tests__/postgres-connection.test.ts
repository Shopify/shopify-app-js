import {parse} from 'pg-connection-string';

/**
 * Unit tests for the connection URL parsing logic used in PostgresConnection.
 * These verify that pg-connection-string + decodeURIComponent produces the
 * correct pool config for all supported URL formats, without requiring a
 * running PostgreSQL instance.
 */

// Replicates the exact parsing logic from postgres-connection.ts init()
function parseConnectionConfig(connectionString: string) {
  const config = parse(connectionString);
  if (config.database) {
    config.database = decodeURIComponent(config.database);
  }
  return config;
}

// Replicates the exact logic from postgres-connection.ts getDatabase()
function getDatabase(connectionString: string): string | undefined {
  const database = parse(connectionString).database;
  return database ? decodeURIComponent(database) : undefined;
}

describe('PostgresConnection URL parsing', () => {
  it('parses a standard TCP connection URL with port', () => {
    const config = parseConnectionConfig(
      'postgres://user:password@localhost:5432/mydb',
    );
    expect(config.host).toBe('localhost');
    expect(config.port).toBe('5432');
    expect(config.user).toBe('user');
    expect(config.password).toBe('password');
    expect(config.database).toBe('mydb');
  });

  it('parses a TCP connection URL without port', () => {
    const config = parseConnectionConfig(
      'postgres://user:password@localhost/mydb',
    );
    expect(config.host).toBe('localhost');
    expect(config.user).toBe('user');
    expect(config.password).toBe('password');
    expect(config.database).toBe('mydb');
  });

  it('parses a Unix socket URL with host query parameter', () => {
    const config = parseConnectionConfig(
      'postgres://user:password@/mydb?host=/cloudsql/my-project:us-central1:my-instance',
    );
    expect(config.host).toBe(
      '/cloudsql/my-project:us-central1:my-instance',
    );
    expect(config.user).toBe('user');
    expect(config.password).toBe('password');
    expect(config.database).toBe('mydb');
  });

  it('decodes special characters in credentials and database name', () => {
    const config = parseConnectionConfig(
      'postgres://shop%26fy:passify%23%24@localhost:5432/shop%26test',
    );
    expect(config.user).toBe('shop&fy');
    expect(config.password).toBe('passify#$');
    expect(config.database).toBe('shop&test');
  });

  it('preserves SSL query parameters', () => {
    const config = parseConnectionConfig(
      'postgres://user:password@localhost/mydb?ssl=true',
    );
    expect(config.ssl).toBe(true);
    expect(config.database).toBe('mydb');
  });

  describe('getDatabase', () => {
    it('returns the decoded database name for a standard URL', () => {
      expect(
        getDatabase('postgres://user:pass@localhost:5432/mydb'),
      ).toBe('mydb');
    });

    it('returns the decoded database name for a Unix socket URL', () => {
      expect(
        getDatabase(
          'postgres://user:pass@/mydb?host=/cloudsql/project:region:instance',
        ),
      ).toBe('mydb');
    });

    it('decodes special characters in database name', () => {
      expect(
        getDatabase('postgres://user:pass@localhost/shop%26test'),
      ).toBe('shop&test');
    });
  });
});
