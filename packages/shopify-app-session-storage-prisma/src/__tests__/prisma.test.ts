import * as child_process from 'child_process';
import {promisify} from 'util';

import {batteryOfTests} from '@shopify/shopify-app-session-storage-test-utils';
import {PrismaClient} from '@prisma/client';

import {PrismaSessionStorage} from '../prisma';

const exec = promisify(child_process.exec);

describe('PrismaSessionStorage', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    await exec('npx prisma migrate dev', {encoding: 'utf8'});

    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.session.deleteMany();
  });

  batteryOfTests(async () => new PrismaSessionStorage(prisma));
});
