import type {SessionParams} from '../lib/session/types';
import {Session} from '../lib/session/session';

import {USER_ID} from './const';

// Utility type to mark all nested parameters as optional
type DeepPartial<T> = T extends object
  ? {[P in keyof T]?: DeepPartial<T[P]>}
  : T;

/**
 * Creates and returns a fake Session for the shop defined in sessionParams.
 *
 * @param sessionParams The Session parameters to use when creating the fake Session.
 * @returns {Session} The fake Session created.
 */
export function setUpValidSession(
  sessionParams: DeepPartial<SessionParams> &
    Pick<SessionParams, 'shop' | 'expires'>,
): Session {
  const overrides: Partial<SessionParams> = {...sessionParams} as SessionParams;
  const shop = sessionParams.shop;
  let id = `offline_${shop}`;
  if (sessionParams.isOnline) {
    const onlineAccessInfo = sessionParams.onlineAccessInfo;
    const associated_user = onlineAccessInfo?.associated_user;
    delete sessionParams.onlineAccessInfo?.associated_user;
    delete sessionParams.onlineAccessInfo;

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
        ...associated_user,
      },
      ...onlineAccessInfo,
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
  });

  return session;
}
