import {Session} from '@shopify/shopify-api';

import {TEST_SHOP} from '../../__tests__/test-helper';

export const REFRESH_TOKEN_RESPONSE = {
  access_token: 'new-access-token',
  scope: 'testScope',
  expires_in: 3600,
  refresh_token: 'new-refresh-token',
  refresh_token_expires_in: 86400,
};

export function buildOfflineSession(overrides: Partial<Session> = {}): Session {
  return new Session({
    id: `offline_${TEST_SHOP}`,
    shop: TEST_SHOP,
    state: '',
    isOnline: false,
    scope: 'testScope',
    accessToken: 'old-access-token',
    // Expiring within the 5 minute window by default
    expires: new Date(Date.now() + 60 * 1000),
    refreshToken: 'old-refresh-token',
    ...overrides,
  });
}
