import {Session} from '@shopify/shopify-api';

import {SessionStorage} from './session-storage';

export class MemorySessionStorage implements SessionStorage {
  private sessions: {[id: string]: Session} = {};

  public async storeSession(session: Session): Promise<boolean> {
    this.sessions[session.id] = session;
    return true;
  }

  public async loadSession(id: string): Promise<Session | undefined> {
    return this.sessions[id] || undefined;
  }

  public async deleteSession(id: string): Promise<boolean> {
    if (this.sessions[id]) {
      delete this.sessions[id];
    }
    return true;
  }

  public async deleteSessions(ids: string[]): Promise<boolean> {
    ids.forEach((id) => delete this.sessions[id]);
    return true;
  }

  public async findSessionsByShop(shop: string): Promise<Session[]> {
    const results = Object.values(this.sessions).filter(
      (session) => session.shop === shop,
    );
    return results;
  }
}
