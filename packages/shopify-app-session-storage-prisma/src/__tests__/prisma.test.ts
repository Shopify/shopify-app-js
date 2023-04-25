import {batteryOfTests} from '@shopify/shopify-app-session-storage-test-utils';
import {PrismaClient} from '@prisma/client';

import {PrismaSessionStorage} from '../prisma';

describe('PrismaSessionStorage', () => {
  const prisma = new PrismaClient();

  beforeAll(async () => {
    // TODO: Run exec on prisma setup, look at postgresql.test.ts for example
    await prisma.session.deleteMany();
  });

  afterAll(async () => {
    await prisma.session.deleteMany();
  });

  batteryOfTests(async () => new PrismaSessionStorage(prisma));
});
