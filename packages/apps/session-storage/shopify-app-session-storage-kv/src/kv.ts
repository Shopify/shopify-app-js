import {Session} from '@shopify/shopify-api';
import {SessionStorage} from '@shopify/shopify-app-session-storage';

export class KVSessionStorage implements SessionStorage {
  private namespace: KVNamespace;

  constructor(namespace?: KVNamespace | undefined) {
    if (namespace) {
      this.setNamespace(namespace);
    }
  }

  public setNamespace(namespace: KVNamespace) {
    this.namespace = namespace;
  }

  public async storeSession(session: Session): Promise<boolean> {
    await this.namespace.put(
      session.id,
      JSON.stringify(session.toPropertyArray(true)),
    );
    await this.addShopIds(session.shop, [session.id]);
    return true;
  }

  public async loadSession(id: string): Promise<Session | undefined> {
    const sessionData = await this.namespace.get<[string, string | number][]>(
      id,
      'json',
    );
    return sessionData
      ? Session.fromPropertyArray(sessionData, true)
      : undefined;
  }

  public async deleteSession(id: string): Promise<boolean> {
    const session = await this.loadSession(id);
    if (!session) {
      return true;
    }

    await this.namespace.delete(id);
    await this.removeShopIds(session.shop, [session.id]);
    return true;
  }

  public async deleteSessions(ids: string[]): Promise<boolean> {
    let result = true;
    for (const id of ids) {
      result = result && (await this.deleteSession(id));
    }

    return result;
  }

  public async findSessionsByShop(shop: string): Promise<Session[]> {
    const sessionIds = await this.namespace.get<string[]>(
      this.getShopSessionIdsKey(shop),
      {type: 'json'},
    );

    if (!sessionIds) {
      return [];
    }

    // Indexes written by earlier versions may contain the same id many times
    const uniqueSessionIds = [...new Set(sessionIds)];

    return Promise.all(
      uniqueSessionIds.map(async (id) => (await this.loadSession(id))!),
    );
  }

  private getShopSessionIdsKey(shop: string): string {
    return `shop:${shop}`;
  }

  private async addShopIds(shop: string, ids: string[]) {
    const key = this.getShopSessionIdsKey(shop);
    const shopIds = (await this.namespace.get<string[]>(key, 'json')) ?? [];
    const updatedShopIds = [...new Set([...shopIds, ...ids])];

    // Storing an existing session (e.g. refreshing a token) leaves the index
    // unchanged, so skip the write
    const unchanged =
      updatedShopIds.length === shopIds.length &&
      updatedShopIds.every((id, index) => id === shopIds[index]);
    if (unchanged) {
      return;
    }

    await this.namespace.put(key, JSON.stringify(updatedShopIds));
  }

  private async removeShopIds(shop: string, ids: string[]) {
    const key = this.getShopSessionIdsKey(shop);
    const shopIds = (await this.namespace.get<string[]>(key, 'json')) ?? [];
    await this.namespace.put(
      key,
      JSON.stringify(shopIds.filter((id) => !ids.includes(id))),
    );
  }
}
