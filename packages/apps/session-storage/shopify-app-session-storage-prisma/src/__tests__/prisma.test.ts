import * as fs from 'fs';
import {execSync} from 'child_process';

import {Session} from '@shopify/shopify-api';
import {batteryOfTests} from '@shopify/shopify-app-session-storage-test-utils';
import {Prisma, PrismaClient} from '@prisma/client';

import {
  MissingSessionStorageError,
  MissingSessionTableError,
  PrismaSessionStorage,
} from '../prisma';

describe('PrismaSessionStorage', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    // Reset the database prior to the tests
    clearTestDatabase();

    execSync('npx prisma migrate dev --name init --preview-feature');

    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.session.deleteMany();
    await prisma.mySession.deleteMany();
  });

  // Using the default table name
  batteryOfTests(
    async () => new PrismaSessionStorage<PrismaClient>(prisma),
    true,
  );

  // Using a custom table name
  batteryOfTests(
    async () =>
      new PrismaSessionStorage<PrismaClient>(prisma, {tableName: 'mySession'}),
    true,
  );

  it('isReady is true when no errors are thrown', async () => {
    const storage = new PrismaSessionStorage<PrismaClient>(prisma);
    await expect(storage.isReady()).resolves.toBe(true);
  });

  it('isReady is false when pollForTable throw an error', async () => {
    const storage = new PrismaSessionStorage<PrismaClient>(prisma);

    jest
      .spyOn(PrismaSessionStorage.prototype as any, 'pollForTable')
      .mockImplementationOnce(() => {
        throw new Error('Database not ready');
      });

    expect(await storage.isReady()).toBe(false);
    await expect(() =>
      storage.findSessionsByShop('shop.myshopify.com'),
    ).rejects.toThrow(MissingSessionStorageError);
  });
});

describe('PrismaSessionStorage when with no database set up', () => {
  beforeAll(async () => {
    clearTestDatabase();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('throws an appropriate error when Prisma migrations were not run', async () => {
    const prisma = new PrismaClient();
    const storage = new PrismaSessionStorage<PrismaClient>(prisma, {
      connectionRetries: 0,
    });

    try {
      await storage.findSessionsByShop('shop.myshopify.com');

      // This should never be reached
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeInstanceOf(MissingSessionTableError);

      const {cause} = error;
      expect(cause.message).toContain(
        'The table `session` does not exist in the current database.',
      );
    }
  });

  it('defaults to 3 tries with 5s intervals', async () => {
    const spy = jest
      .spyOn(global, 'setTimeout')
      .mockImplementation((callback) => callback() as any);

    const prisma = new PrismaClient();
    const storage = new PrismaSessionStorage<PrismaClient>(prisma);

    await expect(() =>
      storage.findSessionsByShop('shop.myshopify.com'),
    ).rejects.toThrow(MissingSessionTableError);

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenNthCalledWith(1, expect.any(Function), 5000);
    expect(spy).toHaveBeenNthCalledWith(2, expect.any(Function), 5000);
  });

  it('allows overriding connection retry settings', async () => {
    const spy = jest
      .spyOn(global, 'setTimeout')
      .mockImplementation((callback) => callback() as any);

    const prisma = new PrismaClient();
    const storage = new PrismaSessionStorage<PrismaClient>(prisma, {
      connectionRetries: 5,
      connectionRetryIntervalMs: 1000,
    });

    await expect(() =>
      storage.findSessionsByShop('shop.myshopify.com'),
    ).rejects.toThrow(MissingSessionTableError);

    expect(spy).toHaveBeenCalledTimes(5);
    expect(spy).toHaveBeenNthCalledWith(1, expect.any(Function), 1000);
    expect(spy).toHaveBeenNthCalledWith(2, expect.any(Function), 1000);
    expect(spy).toHaveBeenNthCalledWith(3, expect.any(Function), 1000);
    expect(spy).toHaveBeenNthCalledWith(4, expect.any(Function), 1000);
    expect(spy).toHaveBeenNthCalledWith(5, expect.any(Function), 1000);
  });
});

describe('Prisma throws P2002 Unique key constraint error on upsert', () => {
  let prisma: PrismaClient;
  let storage: PrismaSessionStorage<PrismaClient>;
  let session: Session;
  let prismaUniqueKeyConstraintError: Prisma.PrismaClientKnownRequestError;

  beforeAll(async () => {
    // Reset the database prior to the tests
    clearTestDatabase();

    execSync('npx prisma migrate dev --name init --preview-feature');

    prisma = new PrismaClient();
    storage = new PrismaSessionStorage<PrismaClient>(prisma);
    session = new Session({
      id: 'session-123',
      shop: 'shop',
      state: 'state',
      isOnline: false,
      accessToken: '123',
      scope: '',
    });

    prismaUniqueKeyConstraintError = new Prisma.PrismaClientKnownRequestError(
      'error message',
      {
        code: 'P2002',
        clientVersion: '0',
      },
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await prisma.session.deleteMany();
  });

  it('handles Prisma unique key constraint errors', async () => {
    mockPrismaError(prisma, prismaUniqueKeyConstraintError);
    await expect(storage.storeSession(session)).resolves.not.toThrow();
  });

  it('Returns true after handling Prisma unique key constraint errors', async () => {
    mockPrismaError(prisma, prismaUniqueKeyConstraintError);
    const result = await storage.storeSession(session);
    expect(result).toBe(true);
  });

  it('Tries upsert again after handling Prisma unique key constraint errors', async () => {
    mockPrismaError(prisma, prismaUniqueKeyConstraintError);

    await storage.storeSession(session);
    expect(prisma.session.upsert).toHaveBeenCalledTimes(2);
  });

  it('Throws other errors that is not unique key constraint error', async () => {
    const expectedError = new Prisma.PrismaClientKnownRequestError(
      'error message',
      {
        code: 'P2003',
        clientVersion: '0',
      },
    );
    mockPrismaError(prisma, expectedError);

    try {
      await storage.storeSession(session);

      // This should never be reached
      expect(true).toBe(false);
    } catch (actualError) {
      expect(actualError).toStrictEqual(expectedError);
    }
  });
});

function clearTestDatabase() {
  const testDbPath = `${__dirname}/../../prisma/test.db`;
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
}

function mockPrismaError(
  prisma: PrismaClient,
  error: Prisma.PrismaClientKnownRequestError,
) {
  jest.spyOn(prisma.session, 'upsert').mockImplementationOnce(() => {
    throw error;
  });
}
