import fs from 'fs';
import {execSync} from 'child_process';
import {createClient} from '@libsql/client';
import {batteryOfTests} from '@shopify/shopify-app-session-storage-test-utils';
import {drizzle} from 'drizzle-orm/libsql';

import {DrizzleSessionStorage} from '../drizzle';

import * as schema from '../drizzle/schema';

export const client = createClient({
  url: 'file:test.db',
});

export const db = drizzle(client, {schema});

describe('DrizzleSessionStorage', () => {
  afterAll(async () => {
    // await db.in.session.deleteMany();
    // await prisma.mySession.deleteMany();
  });

  batteryOfTests(async () => new DrizzleSessionStorage(db));
});
