import {Session as TSSession} from '@shopify/shopify-api';
import {SessionStorage} from '@shopify/shopify-app-session-storage';

import {Session} from '../lib/session/session';

import {USER_ID} from './const';

/**
 * Creates a fake Session in the provided SessionStorage for the shop defined in sessionParams.
 *
 * @param {SessionStorage} sessionStorage The SessionStorage object through which to create the fake Session.
 * @param sessionParams The Session parameters to use when creating the fake Session.
 * @returns {Session} The fake Session created.
 */
export async function setUpValidSession(
  sessionStorage: SessionStorage,
  sessionParams: Partial<Session> & Required<Pick<Session, 'shop'>>,
): Promise<TSSession> {
  const overrides: Partial<Session> = {};
  const shop = sessionParams.shop;
  let id = `offline_${shop}`;
  if (sessionParams?.isOnline) {
    id = `${shop}_${USER_ID}`;
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
    shop,
    isOnline: Boolean(sessionParams.isOnline),
    state: 'test',
    accessToken: 'totally_real_token',
    scope: 'testScope',
    ...overrides,
  }) as TSSession;
  await sessionStorage.storeSession(session);

  return session;
}
