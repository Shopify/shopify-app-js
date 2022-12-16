import {createClient} from 'redis';
import {Session} from '@shopify/shopify-api';

type RedisClient = ReturnType<typeof createClient>;

// need to add shop keys with list of associated session keys to support
// the new findSessionsByShop in v2.x.x
export async function migrateToVersion1_0_1(
  client: RedisClient,
  sessionKeyPrefix: string,
  fullKey: (name: string) => string,
) {
  const shopsAndSessions: {[key: string]: string[]} = {};
  const keys = await client.keys('*');
  for (const key of keys) {
    if (key.startsWith(sessionKeyPrefix)) {
      const session = Session.fromPropertyArray(
        JSON.parse((await client.get(key)) as string),
      );
      if (!shopsAndSessions[session.shop]) {
        shopsAndSessions[session.shop] = [];
      }
      shopsAndSessions[session.shop].push(key);
    }
  }
  // eslint-disable-next-line guard-for-in
  for (const shop in shopsAndSessions) {
    await client.set(fullKey(shop), JSON.stringify(shopsAndSessions[shop]));
  }
}
