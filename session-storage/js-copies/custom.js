import {Session} from '@shopify/shopify-api';

export class CustomSessionStorage {
  constructor(
    storeCallback,
    loadCallback,
    deleteCallback,
    deleteSessionsCallback,
    findSessionsByShopCallback,
  ) {
    this.storeCallback = storeCallback;
    this.loadCallback = loadCallback;
    this.deleteCallback = deleteCallback;
    this.deleteSessionsCallback = deleteSessionsCallback;
    this.findSessionsByShopCallback = findSessionsByShopCallback;
  }

  async storeSession(session) {
    try {
      return await this.storeCallback(session);
    } catch (error) {
      throw new Error(
        `CustomSessionStorage failed to store a session. Error Details: ${error}`,
      );
    }
  }

  async loadSession(id) {
    let result;
    try {
      result = await this.loadCallback(id);
    } catch (error) {
      throw new Error(
        `CustomSessionStorage failed to load a session. Error Details: ${error}`,
      );
    }
    if (result) {
      if (result instanceof Session) {
        if (result.expires && typeof result.expires === 'string') {
          result.expires = new Date(result.expires);
        }

        return result;
      } else if (result instanceof Object && 'id' in result) {
        const session = new Session({...result});

        if (session.expires && typeof session.expires === 'string') {
          session.expires = new Date(session.expires);
        }

        Object.setPrototypeOf(session, Session.prototype);
        return session;
      } else {
        throw new Error(
          `Expected return to be instanceof Session, but received instanceof ${result.constructor.name}.`,
        );
      }
    } else {
      return undefined;
    }
  }

  async deleteSession(id) {
    try {
      return await this.deleteCallback(id);
    } catch (error) {
      throw new Error(
        `CustomSessionStorage failed to delete a session. Error Details: ${error}`,
      );
    }
  }

  async deleteSessions(ids) {
    try {
      return await this.deleteSessionsCallback(ids);
    } catch (error) {
      throw new Error(
        `CustomSessionStorage failed to delete array of sessions. Error Details: ${error}`,
      );
    }
  }

  async findSessionsByShop(shop) {
    let sessions = [];

    try {
      sessions = await this.findSessionsByShopCallback(shop);
    } catch (error) {
      throw new Error(
        `CustomSessionStorage failed to find sessions by shop. Error Details: ${error}`,
      );
    }
    return sessions;
  }
}
