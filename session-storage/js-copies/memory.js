export class MemorySessionStorage {
  sessions = {};

  async storeSession(session) {
    this.sessions[session.id] = session;
    return true;
  }

  async loadSession(id) {
    return this.sessions[id] || undefined;
  }

  async deleteSession(id) {
    if (this.sessions[id]) {
      delete this.sessions[id];
    }
    return true;
  }

  async deleteSessions(ids) {
    ids.forEach((id) => delete this.sessions[id]);
    return true;
  }

  async findSessionsByShop(shop) {
    const results = Object.values(this.sessions).filter(
      (session) => session.shop === shop,
    );
    return results;
  }
}
