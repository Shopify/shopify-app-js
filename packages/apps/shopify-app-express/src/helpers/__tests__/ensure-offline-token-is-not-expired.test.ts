import {Session} from '@shopify/shopify-api';

import {
  shopify,
  mockShopifyResponse,
  TEST_SHOP,
} from '../../__tests__/test-helper';
import {ensureOfflineTokenIsNotExpired} from '../ensure-offline-token-is-not-expired';

const REFRESH_TOKEN_RESPONSE = {
  access_token: 'new-access-token',
  scope: 'testScope',
  expires_in: 3600,
  refresh_token: 'new-refresh-token',
  refresh_token_expires_in: 86400,
};

function buildSession(overrides: Partial<Session> = {}): Session {
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

describe('ensureOfflineTokenIsNotExpired', () => {
  it('does not refresh when the flag is off', async () => {
    shopify.config.future = {expiringOfflineAccessTokens: false};
    const session = buildSession();

    const result = await ensureOfflineTokenIsNotExpired(
      {api: shopify.api, config: shopify.config},
      session,
    );

    expect(result).toBe(session);
    expect(result.accessToken).toBe('old-access-token');
  });

  it('does not refresh when the token is not close to expiring', async () => {
    shopify.config.future = {expiringOfflineAccessTokens: true};
    const session = buildSession({
      expires: new Date(Date.now() + 60 * 60 * 1000),
    });

    const result = await ensureOfflineTokenIsNotExpired(
      {api: shopify.api, config: shopify.config},
      session,
    );

    expect(result).toBe(session);
  });

  it('does not refresh when there is no refresh token', async () => {
    shopify.config.future = {expiringOfflineAccessTokens: true};
    const session = buildSession({refreshToken: undefined});

    const result = await ensureOfflineTokenIsNotExpired(
      {api: shopify.api, config: shopify.config},
      session,
    );

    expect(result).toBe(session);
  });

  it('refreshes and stores the session when the flag is on and the token is expiring', async () => {
    shopify.config.future = {expiringOfflineAccessTokens: true};
    mockShopifyResponse(REFRESH_TOKEN_RESPONSE);
    const session = buildSession();

    const result = await ensureOfflineTokenIsNotExpired(
      {api: shopify.api, config: shopify.config},
      session,
    );

    expect(result.accessToken).toBe('new-access-token');
    expect(result.refreshToken).toBe('new-refresh-token');

    const stored = await shopify.config.sessionStorage.loadSession(
      `offline_${TEST_SHOP}`,
    );
    expect(stored?.accessToken).toBe('new-access-token');
  });
});
