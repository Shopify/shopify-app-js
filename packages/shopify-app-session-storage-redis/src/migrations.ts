import {Session} from '@shopify/shopify-api';

import {RedisConnection} from './redis-connection';

export const migrationMap = new Map([
  ['migrateToVersion1_0_1', migrateToVersion1_0_1],
]);

// need to add shop keys with list of associated session keys to support
// the new findSessionsByShop in v2.x.x
export async function migrateToVersion1_0_1(
  connection: RedisConnection,
): Promise<void> {
  const shopsAndSessions: {[key: string]: string[]} = {};
  const keys = await connection.keys('*');
  for (const key of keys) {
    if (key.startsWith(connection.sessionDBIdentifier)) {
      const session = Session.fromPropertyArray(
        JSON.parse((await connection.get(key, false)) as string),
      );
      if (!shopsAndSessions[session.shop]) {
        shopsAndSessions[session.shop] = [];
      }
      shopsAndSessions[session.shop].push(key);
    }
  }
  // eslint-disable-next-line guard-for-in
  for (const shop in shopsAndSessions) {
    await connection.set(shop, JSON.stringify(shopsAndSessions[shop]));
  }
}
