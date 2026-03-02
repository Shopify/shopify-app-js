import {batteryOfTests} from '@shopify/shopify-app-session-storage-test-utils';

import {MemorySessionStorage} from '../memory';

describe('MemorySessionStorage', () => {
  let storage: MemorySessionStorage;
  beforeAll(async () => {
    storage = new MemorySessionStorage();
  });

  batteryOfTests(async () => storage);
});
