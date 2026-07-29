import {
  shopify,
  mockShopifyResponse,
  TEST_SHOP,
} from '../../__tests__/test-helper';
import {ensureValidOfflineSession} from '../ensure-valid-offline-session';

import {REFRESH_TOKEN_RESPONSE, buildOfflineSession} from './fixtures';

function storeOfflineSession(overrides = {}) {
  return shopify.config.sessionStorage.storeSession(
    buildOfflineSession(overrides),
  );
}

describe('ensureValidOfflineSession', () => {
  it('returns undefined when no offline session exists', async () => {
    shopify.config.future = {expiringOfflineAccessTokens: true};

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

  it('throws when the flag is off, instead of silently doing nothing', async () => {
    shopify.config.future = {expiringOfflineAccessTokens: false};
    await storeOfflineSession();

    await expect(
      ensureValidOfflineSession(
        {api: shopify.api, config: shopify.config},
        TEST_SHOP,
      ),
    ).rejects.toThrow('expiringOfflineAccessTokens');
  });
});
