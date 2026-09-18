import {SignJWT} from 'jose';

import {exchangeToken, IdTokenVerificationError, verifyIdToken} from './index';
import type {IdTokenInput, TokenExchangeInput} from './types';

const clientId = 'test-client';
const clientSecret = 'test-secret';
const secretKey = new TextEncoder().encode(clientSecret);
const shop = 'test-shop.myshopify.com';
const requestedTokenType =
  'urn:shopify:params:oauth:token-type:offline-access-token';
const tokenBody = {
  access_token: 'access-token',
  scope: 'read_products',
  extra: 'preserved',
};

function claims(overrides = {}) {
  return {
    aud: clientId,
    dest: `https://${shop}`,
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...overrides,
  };
}

async function sign(payload = claims(), key = secretKey, alg = 'HS256') {
  return new SignJWT(payload).setProtectedHeader({alg}).sign(key);
}

async function input(
  overrides: Partial<TokenExchangeInput> = {},
): Promise<TokenExchangeInput> {
  return {
    clientId,
    clientSecret,
    secretKey,
    shop,
    requestedTokenType,
    token: await sign(),
    ...overrides,
  };
}

function runtime(response = new Response(JSON.stringify(tokenBody))) {
  return {
    fetch: jest.fn(async () => response),
    validateShop: jest.fn((value: string) => value),
  };
}

afterEach(() => jest.useRealTimers());

describe('core ID-token verification', () => {
  test('returns verified claims without renaming or dropping fields', async () => {
    const payload = claims({sub: '7', extra: {nested: true}});
    expect(
      await verifyIdToken({clientId, secretKey, token: await sign(payload)}),
    ).toEqual(payload);
  });

  test.each([
    ['wrong audience', {aud: 'another-app'}],
    ['array audience', {aud: [clientId]}],
    ['missing audience', {aud: undefined}],
  ])('rejects %s', async (_name, overrides) => {
    await expect(
      verifyIdToken({
        clientId,
        secretKey,
        token: await sign(claims(overrides)),
      }),
    ).rejects.toMatchObject({reason: 'invalid_audience'});
  });

  test.each([{aud: 'another-app'}, {aud: undefined}])(
    'supports the existing decoder audience opt-out: %j',
    async (overrides) => {
      const payload = claims(overrides);
      const result = await verifyIdToken({
        clientId,
        secretKey,
        token: await sign(payload),
        checkAudience: false,
      });
      expect(result).toEqual(JSON.parse(JSON.stringify(payload)));
    },
  );

  test('rejects a bad signature', async () => {
    const token = await sign(
      claims(),
      new TextEncoder().encode('wrong-secret'),
    );
    await expect(
      verifyIdToken({clientId, secretKey, token}),
    ).rejects.toBeInstanceOf(IdTokenVerificationError);
  });

  test.each(['not-a-token', 'e30.e30.invalid'])(
    'rejects malformed tokens: %s',
    async (token) => {
      await expect(
        verifyIdToken({clientId, secretKey, token}),
      ).rejects.toMatchObject({reason: 'invalid_token'});
    },
  );

  test('rejects algorithms other than HS256', async () => {
    const token = await sign(claims(), secretKey, 'HS384');
    await expect(
      verifyIdToken({clientId, secretKey, token}),
    ).rejects.toMatchObject({reason: 'invalid_token'});
  });

  test.each([
    ['exp', -9, true],
    ['exp', -10, false],
    ['nbf', 10, true],
    ['nbf', 11, false],
  ] as const)(
    'keeps the clock tolerance for %s offset %i',
    async (claim, offset, valid) => {
      jest.useFakeTimers();
      const now = Math.floor(Date.now() / 1000);
      const token = await sign(claims({[claim]: now + offset}));
      const result = verifyIdToken({clientId, secretKey, token});
      if (valid)
        await expect(result).resolves.toHaveProperty(claim, now + offset);
      else
        await expect(result).rejects.toMatchObject({reason: 'invalid_token'});
    },
  );

  test.each(['exp', 'nbf'])('rejects non-numeric %s', async (claim) => {
    await expect(
      verifyIdToken({
        clientId,
        secretKey,
        token: await sign(claims({[claim]: 'invalid'})),
      }),
    ).rejects.toMatchObject({reason: 'invalid_token'});
  });
});

describe('core token exchange', () => {
  test('owns verification, destination validation, the request and JSON parsing', async () => {
    const options = await input();
    const response = new Response(JSON.stringify(tokenBody));
    const readBody = jest.spyOn(response, 'text');
    const io = runtime(response);
    const result = await exchangeToken<typeof tokenBody>(options, io);
    expect(result).toEqual({ok: true, shop, body: tokenBody, response});
    expect(readBody).toHaveBeenCalledTimes(1);
    expect(io.validateShop).toHaveBeenCalledWith(shop);
    expect(io.fetch).toHaveBeenCalledWith(
      `https://${shop}/admin/oauth/access_token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
          subject_token: options.token,
          subject_token_type: 'urn:ietf:params:oauth:token-type:id_token',
          requested_token_type: requestedTokenType,
          expiring: '0',
        }),
      },
    );
  });

  test.each([undefined, false, true])(
    'preserves the existing expiring option: %s',
    async (expiring) => {
      const io = runtime();
      await exchangeToken(await input({expiring}), io);
      expect(io.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining(`"expiring":"${expiring ? '1' : '0'}"`),
        }),
      );
    },
  );

  test('rejects invalid JWTs before destination validation or HTTP', async () => {
    const io = runtime();
    await expect(
      exchangeToken(await input({token: 'invalid'}), io),
    ).rejects.toBeInstanceOf(IdTokenVerificationError);
    expect(io.validateShop).not.toHaveBeenCalled();
    expect(io.fetch).not.toHaveBeenCalled();
  });

  test('never disables audience checking during exchange', async () => {
    const io = runtime();
    const options: TokenExchangeInput & Pick<IdTokenInput, 'checkAudience'> = {
      ...(await input({token: await sign(claims({aud: 'another-app'}))})),
      checkAudience: false,
    };
    await expect(exchangeToken(options, io)).rejects.toMatchObject({
      reason: 'invalid_audience',
    });
    expect(io.fetch).not.toHaveBeenCalled();
  });

  test('does not send credentials when destination validation fails', async () => {
    const error = new Error('Invalid shop');
    const io = runtime();
    io.validateShop.mockImplementation(() => {
      throw error;
    });
    await expect(exchangeToken(await input(), io)).rejects.toBe(error);
    expect(io.fetch).not.toHaveBeenCalled();
  });

  test('uses the normalized shop supplied by the SDK', async () => {
    const io = runtime();
    io.validateShop.mockReturnValue('test-shop.myshopify.io');
    const result = await exchangeToken(await input({shop: 'test-shop'}), io);
    expect(result.shop).toBe('test-shop.myshopify.io');
    expect(io.fetch).toHaveBeenCalledWith(
      'https://test-shop.myshopify.io/admin/oauth/access_token',
      expect.any(Object),
    );
  });

  test.each([201, 202])(
    'keeps the SDK success behavior for HTTP %i',
    async (status) => {
      const io = runtime(new Response(JSON.stringify(tokenBody), {status}));
      expect((await exchangeToken(await input(), io)).ok).toBe(true);
    },
  );

  test.each([400, 401, 429, 500])(
    'returns the raw HTTP %i error for SDK mapping, without retrying',
    async (status) => {
      const body = {error: 'invalid_subject_token', errors: 'original detail'};
      const response = new Response(JSON.stringify(body), {
        status,
        headers: {'Retry-After': '2', 'X-Request-Id': 'request-id'},
      });
      const io = runtime(response);
      expect(await exchangeToken(await input(), io)).toEqual({
        ok: false,
        shop,
        body,
        response,
      });
      expect(io.fetch).toHaveBeenCalledTimes(1);
    },
  );

  test.each([200, 429, 500])(
    'preserves JSON errors for HTTP %i',
    async (status) => {
      const io = runtime(new Response('<html>Bad Gateway</html>', {status}));
      await expect(exchangeToken(await input(), io)).rejects.toHaveProperty(
        'name',
        'SyntaxError',
      );
      expect(io.fetch).toHaveBeenCalledTimes(1);
    },
  );

  test('preserves transport errors unchanged', async () => {
    const error = new TypeError('network failure');
    const io = runtime();
    io.fetch.mockRejectedValueOnce(error);
    await expect(exchangeToken(await input(), io)).rejects.toBe(error);
  });

  test('keeps concurrent calls isolated', async () => {
    const first = await input();
    const otherKey = new TextEncoder().encode('other-secret');
    const second = await input({
      clientId: 'other-client',
      clientSecret: 'other-secret',
      secretKey: otherKey,
      token: await sign(claims({aud: 'other-client'}), otherKey),
      shop: 'other-shop.myshopify.com',
    });
    const firstIo = runtime();
    const secondIo = runtime();
    const results = await Promise.all([
      exchangeToken(first, firstIo),
      exchangeToken(second, secondIo),
    ]);
    expect(results.map((result) => result.shop)).toEqual([
      first.shop,
      second.shop,
    ]);
    expect(firstIo.fetch).toHaveBeenCalledWith(
      expect.stringContaining(first.shop),
      expect.objectContaining({
        body: expect.stringContaining('"client_secret":"test-secret"'),
      }),
    );
    expect(secondIo.fetch).toHaveBeenCalledWith(
      expect.stringContaining(second.shop),
      expect.objectContaining({
        body: expect.stringContaining('"client_secret":"other-secret"'),
      }),
    );
  });
});
