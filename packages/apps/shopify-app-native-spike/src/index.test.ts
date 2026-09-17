import {shopifyApp} from './index';
import {executeTokenExchange} from './transport';
import type {TokenExchangeConfig} from './types';

const clientId = 'test-client';
const clientSecret = 'test-secret';
const oldSecret = 'old-secret';
const idToken: TokenExchangeConfig['idToken'] = {
  exchangeable: true,
  token: 'verified-token',
  claims: {dest: 'https://test-shop.myshopify.com'},
};
const config: TokenExchangeConfig = {accessMode: 'offline', idToken};
const tokenBody = {
  access_token: 'access-token',
  scope: 'read_products',
  expires_in: 3600,
  refresh_token: 'refresh-token',
  refresh_token_expires_in: 7200,
};
const app = shopifyApp(clientId, clientSecret, oldSecret);

function mockResponse(body: unknown = tokenBody, status = 200, headers = {}) {
  return new Response(typeof body === 'string' ? body : JSON.stringify(body), {
    status,
    headers,
  });
}

function mockFetch(...responses: Response[]) {
  const send = jest.spyOn(globalThis, 'fetch');
  for (const response of responses) send.mockResolvedValueOnce(response);
  send.mockRejectedValue(new Error('Unexpected extra request'));
  return send;
}

afterEach(() => jest.useRealTimers());

describe('AI Native token exchange', () => {
  test('defaults to expiring tokens and returns the stateless contract', async () => {
    const send = mockFetch(mockResponse());
    const result = await app.exchangeUsingTokenExchange(config);
    expect(result.ok).toBe(true);
    expect(result.accessToken).toEqual({
      shop: 'test-shop',
      token: 'access-token',
      scope: 'read_products',
      accessMode: 'offline',
      expires: expect.any(String),
      refreshToken: 'refresh-token',
      refreshTokenExpires: expect.any(String),
      user: null,
    });
    expect(send).toHaveBeenCalledWith(
      'https://test-shop.myshopify.com/admin/oauth/access_token',
      expect.objectContaining({
        method: 'POST',
        redirect: 'manual',
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
          subject_token: idToken.token,
          subject_token_type: 'urn:ietf:params:oauth:token-type:id_token',
          requested_token_type:
            'urn:shopify:params:oauth:token-type:offline-access-token',
          expiring: 1,
        }),
      }),
    );
    const logs = JSON.stringify(result.httpLogs);
    expect(logs).not.toContain(clientSecret);
    expect(logs).not.toContain(oldSecret);
    expect(logs).not.toContain(idToken.token);
    expect(logs).toContain('[REDACTED]');
  });

  test('retains non-expiring offline tokens when explicitly requested', async () => {
    const send = mockFetch(
      mockResponse({access_token: 'token', scope: 'read_products'}),
    );
    const result = await app.exchangeUsingTokenExchange({
      ...config,
      expiring: false,
    });
    expect(result.accessToken).toMatchObject({
      expires: null,
      refreshToken: null,
      refreshTokenExpires: null,
    });
    expect(JSON.parse(String(send.mock.calls[0][1]?.body)).expiring).toBe(0);
  });

  test('normalizes online user information', async () => {
    mockFetch(
      mockResponse({
        ...tokenBody,
        associated_user_scope: 'read_orders',
        associated_user: {
          id: 7,
          first_name: 'Ada',
          last_name: 'Lovelace',
          email: 'ada@example.com',
          account_owner: false,
          locale: 'en',
          collaborator: true,
          email_verified: true,
        },
      }),
    );
    const result = await app.exchangeUsingTokenExchange({
      ...config,
      accessMode: 'online',
    });
    expect(result.accessToken?.user).toEqual({
      id: 7,
      firstName: 'Ada',
      lastName: 'Lovelace',
      scope: 'read_orders',
      email: 'ada@example.com',
      accountOwner: false,
      locale: 'en',
      collaborator: true,
      emailVerified: true,
    });
  });

  test.each([
    'https://attacker.example?shop=test-shop.myshopify.com',
    'https://test-shop.myshopify.com.attacker.example',
    'https://test-shop.myshopify.com@attacker.example',
    'https://test-shop.myshopify.com/path',
    'https://test-shop.myshopify.com:443',
    'http://test-shop.myshopify.com',
    'https://-bad.myshopify.com',
    'https://test-shop.myshopify.com\n',
    'https://test-shop.myshopify.io',
  ])(
    'rejects unsafe or unsupported destination %s before HTTP',
    async (dest) => {
      const send = mockFetch();
      const result = await app.exchangeUsingTokenExchange({
        ...config,
        idToken: {...idToken, claims: {dest}},
      });
      expect(result.log.code).toBe('configuration_error');
      expect(result.accessToken).toBeNull();
      expect(send).not.toHaveBeenCalled();
    },
  );

  test('rejects non-expiring online requests instead of silently changing them', async () => {
    const send = mockFetch();
    const result = await app.exchangeUsingTokenExchange({
      ...config,
      accessMode: 'online',
      expiring: false,
    });
    expect(result.log.code).toBe('configuration_error');
    expect(send).not.toHaveBeenCalled();
  });

  test.each<TokenExchangeConfig['invalidTokenResponse']>([
    {
      status: 401,
      body: '',
      headers: {'X-Shopify-Retry-Invalid-Session-Request': '1'},
    },
    {
      status: 302,
      body: '',
      headers: {Location: 'https://app.example.com/patch'},
    },
    undefined,
  ])(
    'returns the supplied stale-token recovery response: %j',
    async (invalidTokenResponse) => {
      mockFetch(mockResponse({error: 'invalid_subject_token'}, 400));
      const result = await app.exchangeUsingTokenExchange({
        ...config,
        invalidTokenResponse,
      });
      expect(result.response).toEqual(
        invalidTokenResponse ?? {status: 401, body: '', headers: {}},
      );
      expect(result.log.code).toBe('invalid_subject_token');
    },
  );

  test('waits for Retry-After and then retries', async () => {
    jest.useFakeTimers();
    const send = mockFetch(
      mockResponse('', 429, {'Retry-After': '2'}),
      mockResponse(),
    );
    const result = app.exchangeUsingTokenExchange(config);
    await jest.advanceTimersByTimeAsync(1999);
    expect(send).toHaveBeenCalledTimes(1);
    await jest.advanceTimersByTimeAsync(1);
    expect((await result).ok).toBe(true);
    expect(send).toHaveBeenCalledTimes(2);
  });

  test('stops after three rate-limited attempts', async () => {
    jest.useFakeTimers();
    const send = mockFetch(
      ...Array.from({length: 3}, () =>
        mockResponse('', 429, {'Retry-After': '1'}),
      ),
    );
    const pending = app.exchangeUsingTokenExchange(config);
    await jest.runAllTimersAsync();
    const result = await pending;
    expect(send).toHaveBeenCalledTimes(3);
    expect(result.httpLogs.map(({code}) => code)).toEqual([
      'rate_limited_retry',
      'rate_limited_retry',
      'rate_limit_exceeded',
    ]);
    expect(result.response.status).toBe(429);
  });

  test.each([undefined, 'invalid', '-1'])(
    'handles unusable Retry-After: %s',
    async (header) => {
      jest.useFakeTimers();
      const send = mockFetch(
        mockResponse(
          '',
          429,
          header === undefined ? {} : {'Retry-After': header},
        ),
        mockResponse(),
      );
      const pending = app.exchangeUsingTokenExchange(config);
      await jest.advanceTimersByTimeAsync(1000);
      expect((await pending).ok).toBe(true);
      expect(send).toHaveBeenCalledTimes(2);
    },
  );

  test.each([
    null,
    [],
    {},
    {access_token: '', scope: ''},
    {...tokenBody, expires_in: 'invalid'},
    '<html>Bad Gateway</html>',
  ])('fails closed on invalid success response: %j', async (body) => {
    mockFetch(mockResponse(body));
    const result = await app.exchangeUsingTokenExchange(config);
    expect(result.ok).toBe(false);
    expect(result.accessToken).toBeNull();
    expect(result.response.status).toBe(500);
  });

  test.each([301, 302, 303, 307, 308])(
    'does not follow an HTTP %i redirect with credentials',
    async (status) => {
      const send = mockFetch(
        mockResponse('', status, {Location: 'https://attacker.example'}),
      );
      const result = await app.exchangeUsingTokenExchange(config);
      expect(result.ok).toBe(false);
      expect(result.response.status).toBe(500);
      expect(send).toHaveBeenCalledTimes(1);
      expect(send).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({redirect: 'manual'}),
      );
    },
  );

  test('does not retry a network failure', async () => {
    const send = mockFetch();
    const result = await app.exchangeUsingTokenExchange(config);
    expect(result.log.code).toBe('network_error');
    expect(send).toHaveBeenCalledTimes(1);
  });

  test.each(['invalid_client', 'unknown_error'])(
    'handles %s without retrying',
    async (error) => {
      const send = mockFetch(mockResponse({error}, 400));
      const result = await app.exchangeUsingTokenExchange(config);
      expect(result.response.status).toBe(500);
      expect(send).toHaveBeenCalledTimes(1);
    },
  );

  test('keeps credentials and shops isolated between app instances', async () => {
    const send = mockFetch(mockResponse(), mockResponse());
    const other = shopifyApp('other-client', 'other-secret');
    const [first, second] = await Promise.all([
      app.exchangeUsingTokenExchange(config),
      other.exchangeUsingTokenExchange({
        ...config,
        idToken: {
          ...idToken,
          claims: {dest: 'https://other-shop.myshopify.com'},
        },
      }),
    ]);
    expect(first.shop).toBe('test-shop');
    expect(second.shop).toBe('other-shop');
    expect(
      send.mock.calls.map(([url, options]) => [
        url,
        JSON.parse(String(options?.body)).client_secret,
      ]),
    ).toEqual([
      [
        'https://test-shop.myshopify.com/admin/oauth/access_token',
        clientSecret,
      ],
      [
        'https://other-shop.myshopify.com/admin/oauth/access_token',
        'other-secret',
      ],
    ]);
  });
});

describe('shared exchange transport', () => {
  test('preserves raw response identity, fields and network errors for adapters', async () => {
    const input = {
      clientId,
      clientSecret,
      shopDomain: 'test-shop.myshopify.com',
      idToken: idToken.token,
      requestedTokenType:
        'urn:shopify:params:oauth:token-type:offline-access-token',
      expiring: '0' as const,
    };
    const response = mockResponse();
    const result = await executeTokenExchange(input, async () => response);
    expect(result.ok && result.response).toBe(response);
    const error = new TypeError('network');
    const failed = await executeTokenExchange(input, async () => {
      throw error;
    });
    expect(!failed.ok && failed.error).toBe(error);
  });
});
