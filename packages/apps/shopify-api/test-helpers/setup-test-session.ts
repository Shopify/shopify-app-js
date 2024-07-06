import {SessionStorage} from '@shopify/shopify-app-session-storage';
import {Session} from '../lib/session/session';

export async function setUpValidSession(
  sessionStorage: SessionStorage,
  sessionParams: Partial<Session> & Required<Pick<Session, 'shop'>> = {
    shop: 'test-shop.myshopify.com',
  },
): Promise<Session> {
  const overrides: Partial<Session> = {};
  let id = `offline_${sessionParams.shop}`;
  if (sessionParams?.isOnline) {
    const USER_ID = 12345;
    id = `${sessionParams.shop}_${USER_ID}`;
    // Expires one day from now
    overrides.expires =
      sessionParams.expires || new Date(Date.now() + 1000 * 3600 * 24);
    overrides.onlineAccessInfo = {
      associated_user_scope: 'testScope',
      expires_in: 3600 * 24,
      associated_user: {
        id: USER_ID,
        account_owner: true,
        collaborator: true,
        email: 'test@test.test',
        email_verified: true,
        first_name: 'Test',
        last_name: 'User',
        locale: 'en-US',
      },
    };
  }

  const session = new Session({
    id,
    shop: sessionParams.shop,
    isOnline: Boolean(sessionParams.isOnline),
    state: 'test',
    accessToken: 'totally_real_token',
    scope: 'testScope',
    ...overrides,
  });
  await sessionStorage.storeSession(session);

  return session;
}
