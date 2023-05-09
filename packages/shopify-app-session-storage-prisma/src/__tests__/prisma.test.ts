import {batteryOfTests} from '@shopify/shopify-app-session-storage-test-utils';
import {PrismaClient} from '@prisma/client';

import {PrismaSessionStorage} from '../prisma';

describe('PrismaSessionStorage', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.session.deleteMany();
  });

  batteryOfTests(async () => new PrismaSessionStorage<PrismaClient>(prisma));
});
