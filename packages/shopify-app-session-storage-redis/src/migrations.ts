import {Session} from '@shopify/shopify-api';

import {RedisEngine} from './redis-engine';

export const migrationMap = new Map([
  ['migrateToVersion1_0_1', migrateToVersion1_0_1],
]);

// need to add shop keys with list of associated session keys to support
// the new findSessionsByShop in v2.x.x
export async function migrateToVersion1_0_1(
  engine: RedisEngine,
): Promise<void> {
  const shopsAndSessions: {[key: string]: string[]} = {};
  const keys = await engine.keys('*');
  for (const key of keys) {
    if (key.startsWith(engine.sessionPersistenceIdentifier)) {
      const session = Session.fromPropertyArray(
        JSON.parse((await engine.getWithoutFullKey(key)) as string),
      );
      if (!shopsAndSessions[session.shop]) {
        shopsAndSessions[session.shop] = [];
      }
      shopsAndSessions[session.shop].push(key);
    }
  }
  // eslint-disable-next-line guard-for-in
  for (const shop in shopsAndSessions) {
    await engine.setKey(shop, JSON.stringify(shopsAndSessions[shop]));
  }

  return Promise.resolve();
}
