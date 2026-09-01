import {shopifyApi} from '../../..';
import {testConfig} from '../../../__tests__/test-config';
import {queueMockResponse} from '../../../__tests__/test-helper';
import {DataType} from '../../../clients/types';
import * as ShopifyErrors from '../../../error';
import {LogSeverity} from '../../../types';

import {refreshGlobalApiToken} from '../global-api-client-credentials';

function fakeGlobalToken(claims: Record<string, unknown>): string {
  const encode = (value: unknown) =>
    Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${encode({alg: 'ES256', typ: 'JWT'})}.${encode(claims)}.signature`;
}
function expectTokenRequest(attempts = 1): void {
  expect({
    method: 'POST',
    domain: 'api.shopify.com',
    path: '/auth/access_token',
    attempts,
    data: {
      client_id: 'test_key',
      client_secret: 'test_secret_key',
      grant_type: 'client_credentials',
    },
  }).toMatchMadeHttpRequest();
}

describe('globalApiClientCredentials', () => {
  test('posts app credentials to the Global API token endpoint', async () => {
    const shopify = shopifyApi(testConfig());
    const token = fakeGlobalToken({exp: Math.floor(Date.now() / 1000) + 3600});
    queueMockResponse(JSON.stringify({access_token: token}));

    await shopify.auth.globalApiClientCredentials();

    expect({
      method: 'POST',
      domain: 'api.shopify.com',
      path: '/auth/access_token',
      headers: {
        'Content-Type': DataType.JSON,
        Accept: DataType.JSON,
      },
      data: {
        client_id: shopify.config.apiKey,
        client_secret: shopify.config.apiSecretKey,
        grant_type: 'client_credentials',
      },
    }).toMatchMadeHttpRequest();
  });

  test('uses JWT expiry and scopes from a Global API token', async () => {
    const shopify = shopifyApi(testConfig());
    const expiration = (Math.floor(Date.now() / 1000) + 3600) * 1000;
    const accessToken = fakeGlobalToken({
      exp: expiration / 1000,
      scopes: 'write_global_api_app_events',
    });
    queueMockResponse(JSON.stringify({access_token: accessToken}));

    const {token} = await shopify.auth.globalApiClientCredentials();

    expect(token.accessToken).toBe(accessToken);
    expect(token.expiresAt.getTime()).toBeWithinSecondsOf(expiration, 1);
    expect(token.scopes).toEqual(['write_global_api_app_events']);
  });

  test('uses the fallback expiry for an opaque token without response metadata', async () => {
    const shopify = shopifyApi(testConfig());
    const expectedExpiration = Date.now() + 300_000;
    queueMockResponse(JSON.stringify({access_token: 'opaque'}));

    const {token} = await shopify.auth.globalApiClientCredentials();

    expect(token.expiresAt.getTime()).toBeWithinSecondsOf(
      expectedExpiration,
      1,
    );
    expect(token.scopes).toEqual([]);
  });

  test('uses response expiry metadata for opaque tokens', async () => {
    const shopify = shopifyApi(testConfig());
    const expectedExpiration = Date.now() + 120_000;
    queueMockResponse(
      JSON.stringify({
        access_token: 'opaque',
        expires_in: 120,
        scope: 'read write',
      }),
    );

    const {token} = await shopify.auth.globalApiClientCredentials();

    expect(token.expiresAt.getTime()).toBeWithinSecondsOf(
      expectedExpiration,
      1,
    );
    expect(token.scopes).toEqual(['read', 'write']);
  });

  test('prefers response expiry and scopes over JWT metadata', async () => {
    const shopify = shopifyApi(testConfig());
    const expectedExpiration = Date.now() + 1_000;
    const accessToken = fakeGlobalToken({
      exp: Math.floor(Date.now() / 1000) + 3600,
      scopes: 'jwt_scope',
    });
    queueMockResponse(
      JSON.stringify({
        access_token: accessToken,
        expires_in: 1,
        scope: 'response_scope',
      }),
    );

    const {token} = await shopify.auth.globalApiClientCredentials();

    expect(token.expiresAt.getTime()).toBeWithinSecondsOf(
      expectedExpiration,
      1,
    );
    expect(token.scopes).toEqual(['response_scope']);
  });

  test('preserves an explicit zero expires_in value', async () => {
    const shopify = shopifyApi(testConfig());
    const before = Date.now();
    queueMockResponse(JSON.stringify({access_token: 'opaque', expires_in: 0}));

    const {token} = await shopify.auth.globalApiClientCredentials();

    expect(token.expiresAt.getTime()).toBeGreaterThanOrEqual(before);
    expect(token.expiresAt.getTime()).toBeLessThanOrEqual(Date.now());
  });

  test('preserves an explicit zero JWT exp value', async () => {
    const shopify = shopifyApi(testConfig());
    const accessToken = fakeGlobalToken({exp: 0});
    queueMockResponse(JSON.stringify({access_token: accessToken}));

    const {token} = await shopify.auth.globalApiClientCredentials();

    expect(token.expiresAt.getTime()).toBe(0);
  });

  test('coalesces concurrent cold token requests', async () => {
    const shopify = shopifyApi(testConfig());
    const accessToken = fakeGlobalToken({
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    queueMockResponse(JSON.stringify({access_token: accessToken}));

    const [first, second] = await Promise.all([
      shopify.auth.globalApiClientCredentials(),
      shopify.auth.globalApiClientCredentials(),
    ]);

    expect(first.token.accessToken).toBe(accessToken);
    expect(second.token.accessToken).toBe(accessToken);
    expectTokenRequest();
  });

  test('coalesces concurrent force-refresh requests', async () => {
    const shopify = shopifyApi(testConfig());
    const initialToken = fakeGlobalToken({
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    const refreshedToken = fakeGlobalToken({
      exp: Math.floor(Date.now() / 1000) + 7200,
    });
    queueMockResponse(JSON.stringify({access_token: initialToken}));
    queueMockResponse(JSON.stringify({access_token: refreshedToken}));

    await shopify.auth.globalApiClientCredentials();
    const [first, second] = await Promise.all([
      shopify.auth.globalApiClientCredentials({forceRefresh: true}),
      shopify.auth.globalApiClientCredentials({forceRefresh: true}),
    ]);

    expect(first.token.accessToken).toBe(refreshedToken);
    expect(second.token.accessToken).toBe(refreshedToken);
    expectTokenRequest(2);
  });

  test('reuses a replacement when a stale token is rejected after refresh', async () => {
    const shopify = shopifyApi(testConfig());
    const staleToken = fakeGlobalToken({
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    const replacementToken = fakeGlobalToken({
      exp: Math.floor(Date.now() / 1000) + 7200,
    });
    queueMockResponse(JSON.stringify({access_token: staleToken}));
    queueMockResponse(JSON.stringify({access_token: replacementToken}));

    await shopify.auth.globalApiClientCredentials();
    await shopify.auth.globalApiClientCredentials({forceRefresh: true});
    const result = await refreshGlobalApiToken(shopify.config, staleToken);

    expect(result.accessToken).toBe(replacementToken);
    expectTokenRequest(2);
  });

  test('late stale token refresh joins the in-flight replacement mint', async () => {
    const shopify = shopifyApi(testConfig());
    const tokenT0 = fakeGlobalToken({
      exp: Math.floor(Date.now() / 1000) + 1800,
    });
    const tokenT1 = fakeGlobalToken({
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    const tokenT2 = fakeGlobalToken({
      exp: Math.floor(Date.now() / 1000) + 7200,
    });
    queueMockResponse(JSON.stringify({access_token: tokenT1}));
    await shopify.auth.globalApiClientCredentials();
    queueMockResponse(JSON.stringify({access_token: tokenT2}));

    const replacement = refreshGlobalApiToken(shopify.config, tokenT1);
    const lateRefresh = refreshGlobalApiToken(shopify.config, tokenT0);
    const [replacementResult, lateResult] = await Promise.all([
      replacement,
      lateRefresh,
    ]);

    expect(replacementResult.accessToken).toBe(tokenT2);
    expect(lateResult.accessToken).toBe(tokenT2);
    expectTokenRequest(2);
  });

  test('caches a failed mint before retrying after the cache expires', async () => {
    jest.useFakeTimers();
    try {
      const shopify = shopifyApi(testConfig());
      const accessToken = fakeGlobalToken({
        exp: Math.floor(Date.now() / 1000) + 3600,
      });
      queueMockResponse(JSON.stringify({error: 'temporary'}), {
        statusCode: 500,
      });
      queueMockResponse(JSON.stringify({access_token: accessToken}));

      await expect(shopify.auth.globalApiClientCredentials()).rejects.toThrow(
        ShopifyErrors.HttpInternalError,
      );
      await expect(shopify.auth.globalApiClientCredentials()).rejects.toThrow(
        ShopifyErrors.HttpInternalError,
      );
      expectTokenRequest();

      await jest.advanceTimersByTimeAsync(1_000);
      const result = await shopify.auth.globalApiClientCredentials();

      expect(result.token.accessToken).toBe(accessToken);
      expectTokenRequest();
    } finally {
      jest.useRealTimers();
    }
  });

  test('includes the OAuth error and description in the thrown message', async () => {
    const shopify = shopifyApi(testConfig());
    queueMockResponse(
      JSON.stringify({
        error: 'application_cannot_be_found',
        error_description:
          'Could not find Shopify API application with client_id "test_key".',
      }),
      {statusCode: 400, statusText: 'Bad Request'},
    );

    const error = await shopify.auth
      .globalApiClientCredentials()
      .catch((thrown) => thrown);

    expect(error).toBeInstanceOf(ShopifyErrors.HttpResponseError);
    expect(error.message).toContain('application_cannot_be_found');
    expect(error.message).toContain(
      'Could not find Shopify API application with client_id "test_key".',
    );
  });

  test('refreshes a token inside the sixty-second expiry skew window', async () => {
    const shopify = shopifyApi(testConfig());
    const now = 1_000_000_000;
    const dateNow = jest.spyOn(Date, 'now').mockReturnValue(now);
    const expiringToken = fakeGlobalToken({exp: now / 1000 + 60});
    const refreshedToken = fakeGlobalToken({exp: now / 1000 + 3600});
    queueMockResponse(JSON.stringify({access_token: expiringToken}));
    queueMockResponse(JSON.stringify({access_token: refreshedToken}));

    await shopify.auth.globalApiClientCredentials();
    const result = await shopify.auth.globalApiClientCredentials();

    dateNow.mockRestore();
    expect(result.token.accessToken).toBe(refreshedToken);
    expectTokenRequest(2);
  });

  test('isolates token caches between Shopify API instances', async () => {
    const firstShopify = shopifyApi(testConfig());
    const secondShopify = shopifyApi(testConfig());
    const firstToken = fakeGlobalToken({
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    const secondToken = fakeGlobalToken({
      exp: Math.floor(Date.now() / 1000) + 7200,
    });
    queueMockResponse(JSON.stringify({access_token: firstToken}));
    queueMockResponse(JSON.stringify({access_token: secondToken}));

    const [first, second] = await Promise.all([
      firstShopify.auth.globalApiClientCredentials(),
      secondShopify.auth.globalApiClientCredentials(),
    ]);

    expect(first.token.accessToken).toBe(firstToken);
    expect(second.token.accessToken).toBe(secondToken);
    expectTokenRequest(2);
  });

  test('omits token request bodies from debug logs without changing the wire body', async () => {
    const logFn = jest.fn();
    const shopify = shopifyApi(
      testConfig({
        logger: {
          log: logFn,
          level: LogSeverity.Debug,
          httpRequests: true,
        },
      }),
    );
    const accessToken = fakeGlobalToken({
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    queueMockResponse(JSON.stringify({access_token: accessToken}));
    await shopify.auth.globalApiClientCredentials();

    expect({
      method: 'POST',
      domain: 'api.shopify.com',
      path: '/auth/access_token',
      data: {
        client_id: shopify.config.apiKey,
        client_secret: shopify.config.apiSecretKey,
        grant_type: 'client_credentials',
      },
    }).toMatchMadeHttpRequest();
    const messages = logFn.mock.calls.map(([, message]) => message).join('\n');
    expect(messages).not.toContain('[REDACTED]');
    expect(messages).not.toContain(shopify.config.apiSecretKey);
    expect(messages).not.toContain(shopify.config.apiKey);
    expect(messages).not.toContain(accessToken);
  });

  test('reuses a valid token unless forceRefresh is true', async () => {
    const shopify = shopifyApi(testConfig());
    const firstAccessToken = fakeGlobalToken({
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    const refreshedAccessToken = fakeGlobalToken({
      exp: Math.floor(Date.now() / 1000) + 7200,
    });
    queueMockResponse(JSON.stringify({access_token: firstAccessToken}));
    queueMockResponse(JSON.stringify({access_token: refreshedAccessToken}));

    const first = await shopify.auth.globalApiClientCredentials();
    const cached = await shopify.auth.globalApiClientCredentials();
    const refreshed = await shopify.auth.globalApiClientCredentials({
      forceRefresh: true,
    });

    expect(cached.token.accessToken).toBe(first.token.accessToken);
    expect(refreshed.token.accessToken).toBe(refreshedAccessToken);
    expect({
      method: 'POST',
      domain: 'api.shopify.com',
      path: '/auth/access_token',
      attempts: 2,
      data: {
        client_id: shopify.config.apiKey,
        client_secret: shopify.config.apiSecretKey,
        grant_type: 'client_credentials',
      },
    }).toMatchMadeHttpRequest();
  });

  test('throws HttpResponseError when token minting fails', async () => {
    const shopify = shopifyApi(testConfig());
    queueMockResponse(
      JSON.stringify({
        error: 'application_cannot_be_found',
        error_description: 'Application cannot be found',
      }),
      {statusCode: 400, statusText: 'Bad Request'},
    );

    await expect(shopify.auth.globalApiClientCredentials()).rejects.toThrow(
      ShopifyErrors.HttpResponseError,
    );
  });

  test('throws ShopifyError when the response has no access token', async () => {
    const shopify = shopifyApi(testConfig());
    queueMockResponse(JSON.stringify({token_type: 'Bearer'}));

    await expect(shopify.auth.globalApiClientCredentials()).rejects.toThrow(
      ShopifyErrors.ShopifyError,
    );
  });

  test('posts to a configured Global API URL', async () => {
    const shopify = shopifyApi(
      testConfig({globalApiUrl: 'https://api.my-spin.shopify.io'}),
    );
    const token = fakeGlobalToken({exp: Math.floor(Date.now() / 1000) + 3600});
    queueMockResponse(JSON.stringify({access_token: token}));

    await shopify.auth.globalApiClientCredentials();

    expect({
      method: 'POST',
      domain: 'api.my-spin.shopify.io',
      path: '/auth/access_token',
      data: {
        client_id: shopify.config.apiKey,
        client_secret: shopify.config.apiSecretKey,
        grant_type: 'client_credentials',
      },
    }).toMatchMadeHttpRequest();
  });
});
