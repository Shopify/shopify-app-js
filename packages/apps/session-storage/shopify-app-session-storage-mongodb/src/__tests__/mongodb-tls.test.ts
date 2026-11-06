import {MongoClient} from 'mongodb';

import {MongoDBSessionStorage} from '../mongodb';

jest.mock('mongodb', () => ({
  MongoClient: jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
    db: jest.fn().mockReturnValue({
      command: jest.fn().mockResolvedValue({ok: 1}),
      collections: jest.fn().mockResolvedValue([]),
      collection: jest.fn(),
    }),
  })),
}));

const mockMongoClient = MongoClient as unknown as jest.Mock;

const insecureUrls = [
  'mongodb://user:pass@db.example.com/',
  'mongodb://user:pass@db.example.com/?tls=false',
  'mongodb+srv://user:pass@cluster.example.com/?tls=false',
  'mongodb+srv://user:pass@cluster.example.com/?ssl=false',
  'mongodb://user:pass@db.example.com/?tls=true&tlsInsecure=true',
  'mongodb://user:pass@db.example.com/?tls=true&tlsAllowInvalidCertificates=true',
  'mongodb://user:pass@db.example.com/?tls=true&tlsAllowInvalidHostnames=true',
  'mongodb://user:pass@db.example.com/?tls=false&TLS=true',
  'mongodb://user:pass@db.example.com/?tls=true&tlsAllowInvalidCertificates=true&TLSALLOWINVALIDCERTIFICATES=false',
];

const secureUrls = [
  'mongodb+srv://user:pass@cluster.example.com/',
  'mongodb://user:pass@db.example.com/?tls=true',
  'mongodb://user:pass@db.example.com/?ssl=true',
  'mongodb://user:pass@db.example.com/?TLS=true',
  'mongodb+srv://user:pass@cluster.example.com/?tls=true&tlsAllowInvalidCertificates=false',
];

describe('MongoDBSessionStorage TLS', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    mockMongoClient.mockClear();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('in production', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    it.each(insecureUrls)('refuses %s', (url) => {
      expect(
        () => new MongoDBSessionStorage(new URL(url), 'shopitest'),
      ).toThrow(/requires TLS/);
      expect(mockMongoClient).not.toHaveBeenCalled();
    });

    it.each(secureUrls)('connects to %s', async (url) => {
      const storage = new MongoDBSessionStorage(new URL(url), 'shopitest');

      await expect(storage.ready).resolves.toBeUndefined();
      expect(mockMongoClient).toHaveBeenCalledWith(new URL(url).toString());
    });

    it('connects without TLS when allowInsecureConnection is set', async () => {
      const url = 'mongodb://user:pass@db.example.com/';
      const storage = new MongoDBSessionStorage(new URL(url), 'shopitest', {
        allowInsecureConnection: true,
      });

      await expect(storage.ready).resolves.toBeUndefined();
      expect(mockMongoClient).toHaveBeenCalledWith(url);
    });

    it('connects with a URL that withCredentials builds', async () => {
      const storage = MongoDBSessionStorage.withCredentials(
        'db.example.com',
        'shopitest',
        'user',
        'pass',
        {},
      );

      await expect(storage.ready).resolves.toBeUndefined();
      expect(mockMongoClient).toHaveBeenCalledWith(
        'mongodb://user:pass@db.example.com/?tls=true',
      );
    });
  });

  describe('outside production', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('connects without TLS', async () => {
      const url = 'mongodb://user:pass@localhost/';
      const storage = new MongoDBSessionStorage(new URL(url), 'shopitest');

      await expect(storage.ready).resolves.toBeUndefined();
      expect(mockMongoClient).toHaveBeenCalledWith(url);
    });
  });
});
