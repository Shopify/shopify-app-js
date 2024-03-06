import fs from 'fs';
import {execSync} from 'child_process';

import {Session} from '@shopify/shopify-api';
import {batteryOfTests} from '@shopify/shopify-app-session-storage-test-utils';
import {Prisma, PrismaClient} from '@prisma/client';

import {MissingSessionTableError, PrismaSessionStorage} from '../prisma';

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
  batteryOfTests(async () => new PrismaSessionStorage<PrismaClient>(prisma));

  // Using a custom table name
  batteryOfTests(
    async () =>
      new PrismaSessionStorage<PrismaClient>(prisma, {tableName: 'mySession'}),
  );
});

describe('PrismaSessionStorage when with no database set up', () => {
  beforeAll(async () => {
    clearTestDatabase();
  });

  it('throws an appropriate error when Prisma migrations were not run', async () => {
    const prisma = new PrismaClient();
    const storage = new PrismaSessionStorage<PrismaClient>(prisma);

    try {
      await storage.findSessionsByShop('shop.myshopify.com');

      // This should never be reached
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeInstanceOf(MissingSessionTableError);

      const {cause} = error;
      expect(cause.message).toContain(
        'The table `main.Session` does not exist in the current database.',
      );
    }
  });
});

describe('Prisma throws P2002 on upsert', () => {
  let prisma: PrismaClient;
  let storage: PrismaSessionStorage<PrismaClient>;
  let session: Session;

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

    jest.spyOn(prisma.session, 'upsert').mockImplementation(() => {
      throw new Prisma.PrismaClientKnownRequestError('error message', {
        code: 'P2002',
      });
    });
  });

  afterAll(async () => {
    await prisma.session.deleteMany();
    jest.clearAllMocks();
  });

  it('handles Prisma P2002 errors', async () => {
    await expect(storage.storeSession(session)).resolves.not.toThrow();
  });

  it('Returns true after handling Prisma P2002 errors', async () => {
    const result = await storage.storeSession(session);
    expect(result).toBe(true);
  });
});

function clearTestDatabase() {
  const testDbPath = `${__dirname}/../../prisma/test.db`;
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
}
