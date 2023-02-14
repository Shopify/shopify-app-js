import {Session} from '@shopify/shopify-api';
import {MigrationOperation} from '@shopify/shopify-app-session-storage';

import {RedisConnection} from './redis-connection';

export const migrationList = [
  new MigrationOperation(
    // This migration name cannot be chnaged as it has already been released
    'migrateToVersion1_0_1',
    migrateAddShopKeyToTrackSessionsByShop,
  ),
];

// need to add shop keys with list of associated session keys to support
// the new findSessionsByShop in v2.x.x
export async function migrateAddShopKeyToTrackSessionsByShop(
  connection: RedisConnection,
): Promise<void> {
  const shopsAndSessions: {[key: string]: string[]} = {};
  const keys = await connection.keys('*');
  for (const key of keys) {
    if (key.startsWith(connection.sessionStorageIdentifier)) {
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
