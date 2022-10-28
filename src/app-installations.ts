import {Session} from '@shopify/shopify-api';

import {storage} from './storage';

export class AppInstallations {
  async includes(shopDomain: string): Promise<boolean> {
    const shopSessions = await storage.findSessionsByShop!(shopDomain);
    if (shopSessions.length > 0) {
      for (const session of shopSessions) {
        if (session.accessToken) return true;
      }
    }
    return false;
  }

  async delete(shopDomain: string): Promise<void> {
    const shopSessions = await storage.findSessionsByShop!(shopDomain);
    if (shopSessions.length > 0) {
      await storage.deleteSessions!(
        shopSessions.map((session: Session) => session.id),
      );
    }
  }
}
