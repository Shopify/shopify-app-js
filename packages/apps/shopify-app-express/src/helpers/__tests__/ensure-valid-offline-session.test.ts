import {Session} from '@shopify/shopify-api';

import {
  shopify,
  mockShopifyResponse,
  TEST_SHOP,
} from '../../__tests__/test-helper';
import {ensureValidOfflineSession} from '../ensure-valid-offline-session';

const REFRESH_TOKEN_RESPONSE = {
  access_token: 'new-access-token',
  scope: 'testScope',
  expires_in: 3600,
  refresh_token: 'new-refresh-token',
  refresh_token_expires_in: 86400,
};

function storeOfflineSession(overrides: Partial<Session> = {}) {
  const session = new Session({
    id: `offline_${TEST_SHOP}`,
    shop: TEST_SHOP,
    state: '',
    isOnline: false,
    scope: 'testScope',
    accessToken: 'old-access-token',
    expires: new Date(Date.now() + 60 * 1000),
    refreshToken: 'old-refresh-token',
    ...overrides,
  });
  return shopify.config.sessionStorage.storeSession(session);
}

describe('ensureValidOfflineSession', () => {
  it('returns undefined when no offline session exists', async () => {
    const result = await ensureValidOfflineSession(
      {api: shopify.api, config: shopify.config},
      TEST_SHOP,
    );

    expect(result).toBeUndefined();
  });

  it('loads and refreshes an expiring offline session when the flag is on', async () => {
    shopify.config.future = {expiringOfflineAccessTokens: true};
    await storeOfflineSession();
    mockShopifyResponse(REFRESH_TOKEN_RESPONSE);

    const result = await ensureValidOfflineSession(
      {api: shopify.api, config: shopify.config},
      TEST_SHOP,
    );

    expect(result?.accessToken).toBe('new-access-token');
  });

  it('returns the stored session unchanged when the flag is off', async () => {
    shopify.config.future = {expiringOfflineAccessTokens: false};
    await storeOfflineSession();

    const result = await ensureValidOfflineSession(
      {api: shopify.api, config: shopify.config},
      TEST_SHOP,
    );

    expect(result?.accessToken).toBe('old-access-token');
  });
});
