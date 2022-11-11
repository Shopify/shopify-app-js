import {createClient} from 'redis';
import {Session} from '@shopify/shopify-api';

const defaultRedisSessionStorageOptions = {
  sessionKeyPrefix: 'shopify_sessions',
};

export class RedisSessionStorage {
  static withCredentials(host, db, username, password, opts) {
    return new RedisSessionStorage(
      new URL(
        `redis://${encodeURIComponent(username)}:${encodeURIComponent(
          password,
        )}@${host}/${db}`,
      ),
      opts,
    );
  }

  constructor(dbUrl, opts = {}) {
    this.dbUrl = dbUrl;
    if (typeof this.dbUrl === 'string') {
      this.dbUrl = new URL(this.dbUrl);
    }
    this.options = {...defaultRedisSessionStorageOptions, ...opts};
    this.ready = this.init();
  }

  async storeSession(session) {
    await this.ready;

    await this.client.set(
      this.fullKey(session.id),
      JSON.stringify(session.toPropertyArray()),
    );
    return true;
  }

  async loadSession(id) {
    await this.ready;

    let rawResult = await this.client.get(this.fullKey(id));

    if (!rawResult) return undefined;
    rawResult = JSON.parse(rawResult);

    return Session.fromPropertyArray(rawResult);
  }

  async deleteSession(id) {
    await this.ready;
    await this.client.del(this.fullKey(id));
    return true;
  }

  async deleteSessions(ids) {
    await this.ready;
    await this.client.del(ids.map((id) => this.fullKey(id)));
    return true;
  }

  async findSessionsByShop(shop) {
    await this.ready;

    const keys = await this.client.keys('*');
    const results = [];
    for (const key of keys) {
      const rawResult = await this.client.get(key);
      if (!rawResult) continue;

      const session = Session.fromPropertyArray(JSON.parse(rawResult));
      if (session.shop === shop) results.push(session);
    }

    return results;
  }

  async disconnect() {
    await this.client.quit();
  }

  fullKey(name) {
    return `${this.options.sessionKeyPrefix}_${name}`;
  }

  async init() {
    this.client = createClient({
      ...this.options,
      url: this.dbUrl.toString(),
    });
    if (this.options.onError) {
      this.client.on('error', this.options.onError);
    }
    await this.client.connect();
  }
}
