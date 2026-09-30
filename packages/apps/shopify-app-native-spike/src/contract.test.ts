import {SignJWT} from 'jose';

import {exchangeToken, exchangeUsingTokenExchange} from './index';
import * as engine from './exchange';
import type {TokenExchangeConfig, SendRequest} from './types';

const credentials = {
  clientId: 'test-client',
  clientSecret: 'current-secret',
  oldClientSecret: 'old-secret',
};
const shop = 'test-shop.myshopify.com';
const config: TokenExchangeConfig = {
  accessMode: 'offline',
  idToken: {
    exchangeable: true,
    token: 'verified-token',
    claims: {dest: `https://${shop}`},
  },
};
const body = {
  access_token: 'access-token',
  scope: 'read_products',
  expires_in: 3600,
  refresh_token: 'refresh-token',
  refresh_token_expires_in: 7200,
};

function json(
  value: unknown = body,
  status = 200,
  headers: Record<string, string> = {},
) {
  return new Response(
    typeof value === 'string' ? value : JSON.stringify(value),
    {status, headers},
  );
}

function mockFetch(...responses: Response[]) {
  const fetch = jest.fn<ReturnType<SendRequest>, Parameters<SendRequest>>();
  responses.forEach((response) => fetch.mockResolvedValueOnce(response));
  fetch.mockRejectedValue(new Error('Unexpected request'));
  return fetch;
}

async function sdkInput() {
  const secretKey = new TextEncoder().encode(credentials.clientSecret);
  return {
    ...credentials,
    shop,
    secretKey,
    token: await new SignJWT({
      aud: credentials.clientId,
      exp: Math.floor(Date.now() / 1000) + 3600,
    })
      .setProtectedHeader({alg: 'HS256'})
      .sign(secretKey),
    requestedTokenType:
      'urn:shopify:params:oauth:token-type:offline-access-token',
  };
}

afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

test('the contract and SDK compatibility adapter use the same exchange implementation', async () => {
  const shared = jest.spyOn(engine, 'runTokenExchange');
  const fetch = mockFetch(json(), json());
  const native = await exchangeUsingTokenExchange(credentials, config, fetch);
  const sdk = await exchangeToken(await sdkInput(), {
    fetch,
    validateShop: (value) => value,
  });
  expect(shared).toHaveBeenCalledTimes(2);
  expect(native.ok).toBe(true);
  expect(sdk.ok).toBe(true);
  expect(native.accessToken?.token).toBe(
    (sdk.body as typeof body).access_token,
  );
  const sent = fetch.mock.calls.map(([, options]) =>
    JSON.parse(String(options.body)),
  );
  expect(sent[0].expiring).toBe(1);
  expect(sent[1].expiring).toBe('0');
  expect(shared.mock.calls[0][2]).toEqual({maxRetries: 2, redirect: 'manual'});
  expect(shared.mock.calls[1][2]).toEqual({maxRetries: 0});
});

test('disabling the shared implementation breaks both entry points', async () => {
  const error = new Error('Shared implementation disabled');
  const shared = jest
    .spyOn(engine, 'runTokenExchange')
    .mockRejectedValue(error);
  const fetch = mockFetch();
  await expect(
    exchangeUsingTokenExchange(credentials, config, fetch),
  ).rejects.toBe(error);
  await expect(
    exchangeToken(await sdkInput(), {fetch, validateShop: (value) => value}),
  ).rejects.toBe(error);
  expect(shared).toHaveBeenCalledTimes(2);
  expect(fetch).not.toHaveBeenCalled();
});

test('returns contract token fields and redacted request logs', async () => {
  const fetch = mockFetch(json());
  const result = await exchangeUsingTokenExchange(credentials, config, fetch);
  expect(result.accessToken).toEqual({
    shop: 'test-shop',
    accessMode: 'offline',
    token: body.access_token,
    scope: body.scope,
    expires: expect.any(String),
    refreshToken: body.refresh_token,
    refreshTokenExpires: expect.any(String),
    user: null,
  });
  expect(result.response).toEqual({status: 200, body: '', headers: {}});
  expect(Object.keys(result).sort()).toEqual([
    'accessToken',
    'httpLogs',
    'log',
    'ok',
    'response',
    'shop',
  ]);
  const logs = JSON.stringify(result.httpLogs);
  expect(logs).not.toContain(credentials.clientSecret);
  expect(logs).not.toContain(credentials.oldClientSecret);
  expect(logs).not.toContain(config.idToken.token);
  expect(JSON.parse(String(fetch.mock.calls[0][1].body)).client_secret).toBe(
    credentials.clientSecret,
  );
});

test('online user fields follow the shared names', async () => {
  const fetch = mockFetch(
    json({
      ...body,
      associated_user_scope: 'read_products',
      associated_user: {
        id: 7,
        first_name: 'Ada',
        last_name: 'Lovelace',
        email: 'ada@example.com',
        account_owner: true,
        locale: 'en',
        collaborator: false,
        email_verified: true,
      },
    }),
  );
  const result = await exchangeUsingTokenExchange(
    credentials,
    {...config, accessMode: 'online'},
    fetch,
  );
  expect(result.accessToken?.user).toEqual({
    id: 7,
    firstName: 'Ada',
    lastName: 'Lovelace',
    scope: 'read_products',
    email: 'ada@example.com',
    accountOwner: true,
    locale: 'en',
    collaborator: false,
    emailVerified: true,
  });
});

test('explicit non-expiring offline requests return null expiries', async () => {
  const fetch = mockFetch(
    json({access_token: 'token', scope: 'read_products'}),
  );
  const result = await exchangeUsingTokenExchange(
    credentials,
    {...config, expiring: false},
    fetch,
  );
  expect(result.accessToken).toMatchObject({
    expires: null,
    refreshToken: null,
    refreshTokenExpires: null,
  });
  expect(JSON.parse(String(fetch.mock.calls[0][1].body)).expiring).toBe(0);
});

test('the native contract rejects non-expiring online requests without HTTP', async () => {
  const fetch = mockFetch();
  const result = await exchangeUsingTokenExchange(
    credentials,
    {...config, accessMode: 'online', expiring: false},
    fetch,
  );
  expect(result.log.code).toBe('configuration_error');
  expect(fetch).not.toHaveBeenCalled();
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
])('rejects unsafe or unsupported native destination %s', async (dest) => {
  const fetch = mockFetch();
  const result = await exchangeUsingTokenExchange(
    credentials,
    {...config, idToken: {...config.idToken, claims: {dest}}},
    fetch,
  );
  expect(result.log.code).toBe('configuration_error');
  expect(fetch).not.toHaveBeenCalled();
});

test.each<TokenExchangeConfig['invalidTokenResponse']>([
  {
    status: 401,
    body: '',
    headers: {'X-Shopify-Retry-Invalid-Session-Request': '1'},
  },
  {status: 302, body: '', headers: {Location: 'https://app.example.com/patch'}},
  null,
])(
  'returns the provided invalid-token response: %j',
  async (invalidTokenResponse) => {
    const fetch = mockFetch(json({error: 'invalid_subject_token'}, 400));
    const result = await exchangeUsingTokenExchange(
      credentials,
      {...config, invalidTokenResponse},
      fetch,
    );
    expect(result.response).toEqual(
      invalidTokenResponse ?? {status: 401, body: '', headers: {}},
    );
  },
);

test('native rate limiting waits before retry, whereas the SDK returns immediately', async () => {
  const input = await sdkInput();
  jest.useFakeTimers();
  const fetch = mockFetch(json('', 429, {'Retry-After': '2'}), json());
  const pending = exchangeUsingTokenExchange(credentials, config, fetch);
  await jest.advanceTimersByTimeAsync(1999);
  expect(fetch).toHaveBeenCalledTimes(1);
  await jest.advanceTimersByTimeAsync(1);
  expect((await pending).ok).toBe(true);
  expect(fetch).toHaveBeenCalledTimes(2);
  const sdkFetch = mockFetch(json({error: 'throttled'}, 429));
  const sdk = await exchangeToken(input, {
    fetch: sdkFetch,
    validateShop: (value) => value,
  });
  expect(sdk.ok).toBe(false);
  expect(sdkFetch).toHaveBeenCalledTimes(1);
});

test('native rate limiting stops after three requests', async () => {
  jest.useFakeTimers();
  const fetch = mockFetch(
    ...Array.from({length: 3}, () => json('', 429, {'Retry-After': '1'})),
  );
  const pending = exchangeUsingTokenExchange(credentials, config, fetch);
  await jest.runAllTimersAsync();
  const result = await pending;
  expect(result.response).toEqual({
    status: 429,
    body: '{"error":"Too many requests"}',
    headers: {'Content-Type': 'application/json'},
  });
  expect(result.httpLogs.map((log) => log.code)).toEqual([
    'rate_limited_retry',
    'rate_limited_retry',
    'rate_limit_exceeded',
  ]);
  expect(fetch).toHaveBeenCalledTimes(3);
});

test.each([undefined, 'invalid', '-1'])(
  'handles unusable Retry-After: %s',
  async (value) => {
    jest.useFakeTimers();
    const fetch = mockFetch(
      json('', 429, value === undefined ? {} : {'Retry-After': value}),
      json(),
    );
    const pending = exchangeUsingTokenExchange(credentials, config, fetch);
    await jest.advanceTimersByTimeAsync(1000);
    expect((await pending).ok).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(2);
  },
);

test.each([301, 302, 303, 307, 308])(
  'does not forward native exchange credentials after HTTP %i',
  async (status) => {
    const fetch = mockFetch(
      json('', status, {Location: 'https://attacker.example'}),
    );
    const result = await exchangeUsingTokenExchange(credentials, config, fetch);
    expect(result.ok).toBe(false);
    expect(result.response.status).toBe(500);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][1].redirect).toBe('manual');
  },
);

test.each([
  null,
  [],
  {},
  {access_token: '', scope: ''},
  {...body, expires_in: 'invalid'},
  {...body, associated_user: {id: 'invalid'}},
  '<html>Bad Gateway</html>',
])('fails closed on malformed native success: %j', async (payload) => {
  const result = await exchangeUsingTokenExchange(
    credentials,
    config,
    mockFetch(json(payload)),
  );
  expect(result.ok).toBe(false);
  expect(result.accessToken).toBeNull();
  expect(result.response.status).toBe(500);
});

test.each([201, 202])(
  'native contract requires 200, unlike SDK acceptance of %i',
  async (status) => {
    const result = await exchangeUsingTokenExchange(
      credentials,
      config,
      mockFetch(json(body, status)),
    );
    expect(result.ok).toBe(false);
    expect(result.log.code).toBe('exchange_error');
  },
);

test.each(['invalid_client', 'unknown_error'])(
  'returns native failure for %s without retries',
  async (error) => {
    const fetch = mockFetch(json({error}, 400));
    const result = await exchangeUsingTokenExchange(credentials, config, fetch);
    expect(result.response.status).toBe(500);
    expect(fetch).toHaveBeenCalledTimes(1);
  },
);

test('network errors use the native failure result rather than throwing', async () => {
  const fetch = mockFetch();
  const result = await exchangeUsingTokenExchange(credentials, config, fetch);
  expect(result.log.code).toBe('network_error');
  expect(result.httpLogs[0].res).toEqual({status: 0, body: '', headers: {}});
  expect(fetch).toHaveBeenCalledTimes(1);
});
