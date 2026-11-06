import {decodeJwt, decodeProtectedHeader, jwtVerify} from 'jose';

import {shopifyApi} from '../../..';
// Imported from the package root on purpose: this type now carries the public `clientAssertion`
// option, so a typed wrapper needs to reach it.
import type {ClientCredentialsParams} from '../../..';
import {testConfig} from '../../../__tests__/test-config';
import {queueMockResponse} from '../../../__tests__/test-helper';
import * as ShopifyErrors from '../../../error';
import {DataType} from '../../../clients/types';
import {LogSeverity} from '../../../types';
import {canonicalizeHeaders, setAbstractFetchFunc} from '../../../../runtime';
import {mockTestRequests} from '../../../../adapters/mock/mock_test_requests';
import {mockRequestCapture} from '../../../../adapters/mock/mock_request_capture';
import {mockFetch} from '../../../../adapters/mock/adapter';

const CLIENT_ASSERTION_TYPE =
  'urn:ietf:params:oauth:client-assertion-type:jwt-bearer';

describe('clientCredentials', () => {
  const shop = 'test-shop.myshopify.io';

  describe('with valid parameters', () => {
    test('returns a session on success', async () => {
      const shopify = shopifyApi(testConfig());
      const successResponse = {
        access_token: 'some_access_token',
        scope: 'write_products,read_orders',
        expires_in: 3600,
      };

      const expectedExpiration = new Date(
        Date.now() + successResponse.expires_in * 1000,
      ).getTime();

      queueMockResponse(JSON.stringify(successResponse));

      const response = await shopify.auth.clientCredentials({
        shop,
      });

      // Verify the request was made with correct parameters
      expect({
        method: 'POST',
        domain: shop,
        path: '/admin/oauth/access_token',
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

      // Verify the response contains expected session data
      expect(response.session).toEqual(
        expect.objectContaining({
          accessToken: successResponse.access_token,
          scope: successResponse.scope,
        }),
      );

      expect(response.session?.expires?.getTime()).toBeWithinSecondsOf(
        expectedExpiration,
        1,
      );
    });

    test('does not log credentials when debug HTTP logging is enabled', async () => {
      const logFn = jest.fn();
      const shopify = shopifyApi(
        testConfig({
          logger: {log: logFn, level: LogSeverity.Debug, httpRequests: true},
        }),
      );

      const successResponse = {
        access_token: 'some_access_token',
        scope: 'write_products,read_orders',
        expires_in: 3600,
      };
      queueMockResponse(JSON.stringify(successResponse));

      await shopify.auth.clientCredentials({shop});

      const messages = logFn.mock.calls.map(([_severity, message]) => message);
      expect(
        messages.some((message) => message.includes('Making HTTP request')),
      ).toBe(true);
      messages.forEach((message) => {
        expect(message).not.toContain(shopify.config.apiSecretKey);
        expect(message).not.toContain(successResponse.access_token);
      });
    });

    test('throws error when response is not successful', async () => {
      const shopify = shopifyApi(testConfig());
      const errorResponse = {
        error: 'invalid_client',
        error_description: 'Client authentication failed',
      };

      queueMockResponse(JSON.stringify(errorResponse), {
        statusCode: 400,
        statusText: 'Bad request',
      });

      await expect(
        shopify.auth.clientCredentials({
          shop,
        }),
      ).rejects.toThrow(ShopifyErrors.HttpResponseError);
    });
  });

  describe('with invalid parameters', () => {
    test('throws error for invalid shop domain', async () => {
      const shopify = shopifyApi(testConfig());
      const invalidShop = 'invalid-shop-url';

      await expect(
        shopify.auth.clientCredentials({
          shop: invalidShop,
        }),
      ).rejects.toThrow(ShopifyErrors.InvalidShopError);
    });

    test('throws error for non-myshopify domain', async () => {
      const shopify = shopifyApi(testConfig());
      const invalidShop = 'test-shop.something.com';

      await expect(
        shopify.auth.clientCredentials({
          shop: invalidShop,
        }),
      ).rejects.toThrow(ShopifyErrors.InvalidShopError);
    });
  });

  describe('with a client assertion', () => {
    const clientAssertion = 'header.payload.signature';
    const successResponse = {
      access_token: 'some_access_token',
      scope: 'write_products,read_orders',
      expires_in: 3600,
    };

    test('sends only the assertion fields, and never the client secret', async () => {
      const shopify = shopifyApi(testConfig());
      queueMockResponse(JSON.stringify(successResponse));

      await shopify.auth.clientCredentials({shop, clientAssertion});

      const request = mockTestRequests.getRequest()!;
      const body = JSON.parse(request.body as string);

      expect(Object.keys(body).sort()).toEqual([
        'client_assertion',
        'client_assertion_type',
        'client_id',
        'grant_type',
      ]);
      expect(body).toEqual({
        client_id: shopify.config.apiKey,
        grant_type: 'client_credentials',
        client_assertion_type: CLIENT_ASSERTION_TYPE,
        client_assertion: clientAssertion,
      });
      expect(request.method).toBe('POST');
      expect(request.url).toBe(`https://${shop}/admin/oauth/access_token`);
    });

    test('sends no authorization header, and no access token header', async () => {
      const shopify = shopifyApi(testConfig());
      queueMockResponse(JSON.stringify(successResponse));

      await shopify.auth.clientCredentials({shop, clientAssertion});

      const headers = mockTestRequests.getRequest()!.headers;

      expect(Object.keys(headers).sort()).toEqual(['Accept', 'Content-Type']);
      expect(headers).toEqual(
        canonicalizeHeaders({
          'Content-Type': DataType.JSON,
          Accept: DataType.JSON,
        }),
      );
    });

    test('makes one attempt and does not retry with the secret when rejected', async () => {
      const shopify = shopifyApi(testConfig());
      queueMockResponse(JSON.stringify({error: 'invalid_client'}), {
        statusCode: 401,
        statusText: 'Unauthorized',
      });

      await expect(
        shopify.auth.clientCredentials({shop, clientAssertion}),
      ).rejects.toThrow(ShopifyErrors.HttpResponseError);

      expect(mockTestRequests.requestList).toHaveLength(1);
      expect(mockTestRequests.requestList[0].body).not.toContain(
        'client_secret',
      );
    });

    test('returns a session with the response scopes and expiry', async () => {
      const shopify = shopifyApi(testConfig());
      const expiringResponse = {...successResponse, expires_in: 86400};
      const expectedExpiration = new Date(
        Date.now() + expiringResponse.expires_in * 1000,
      ).getTime();

      queueMockResponse(JSON.stringify(expiringResponse));

      const {session} = await shopify.auth.clientCredentials({
        shop,
        clientAssertion,
      });

      expect(session.accessToken).toBe(expiringResponse.access_token);
      expect(session.scope).toBe(expiringResponse.scope);
      expect(session.isOnline).toBe(false);
      expect(session.refreshToken).toBeUndefined();
      expect(session.expires?.getTime()).toBeWithinSecondsOf(
        expectedExpiration,
        1,
      );
    });

    test.each([
      ['an empty string', ''],
      ['a blank string', '   '],
      ['a non-string value', 12345],
      ['null', null],
    ])('rejects %s without making a request', async (_label, value) => {
      const shopify = shopifyApi(testConfig());

      await expect(
        shopify.auth.clientCredentials({
          shop,
          clientAssertion: value as unknown as string,
        }),
      ).rejects.toThrow(ShopifyErrors.MissingRequiredArgument);

      expect(mockTestRequests.requestList).toHaveLength(0);
    });

    test('uses the configured secret when the assertion is omitted or undefined', async () => {
      const shopify = shopifyApi(testConfig());

      queueMockResponse(JSON.stringify(successResponse));
      await shopify.auth.clientCredentials({shop});

      queueMockResponse(JSON.stringify(successResponse));
      await shopify.auth.clientCredentials({shop, clientAssertion: undefined});

      for (const request of mockTestRequests.requestList) {
        const body = JSON.parse(request.body as string);
        expect(body.client_secret).toBe(shopify.config.apiSecretKey);
        expect(body).not.toHaveProperty('client_assertion');
        expect(body).not.toHaveProperty('client_assertion_type');
      }
    });

    test('rejects a blank apiKey, which assertion auth sends as the client_id', async () => {
      const shopify = shopifyApi(
        testConfig({
          apiKey: '',
          isCustomStoreApp: true,
          adminApiAccessToken: 'test_admin_api_access_token',
        }),
      );

      await expect(
        shopify.auth.clientCredentials({shop, clientAssertion}),
      ).rejects.toThrow(ShopifyErrors.MissingRequiredArgument);

      expect(mockTestRequests.requestList).toHaveLength(0);
    });

    test('sends the assertion to the host the configured transformation routes to', async () => {
      const shopify = shopifyApi(
        testConfig({
          domainTransformations: [
            {
              match: /^([a-zA-Z0-9][a-zA-Z0-9-_]*)\.myshopify\.io$/,
              transform: '$1.transformed.myshopify.io',
            },
          ],
        }),
      );
      queueMockResponse(JSON.stringify(successResponse));

      await shopify.auth.clientCredentials({shop, clientAssertion});

      const request = mockTestRequests.getRequest()!;

      expect(request.url).toBe(
        'https://test-shop.transformed.myshopify.io/admin/oauth/access_token',
      );
      expect(JSON.parse(request.body as string)).toEqual({
        client_id: shopify.config.apiKey,
        grant_type: 'client_credentials',
        client_assertion_type: CLIENT_ASSERTION_TYPE,
        client_assertion: clientAssertion,
      });
      expect(mockRequestCapture.lastRequestInit!.redirect).toBe('manual');
    });

    test('keeps the shop host when a transformation maps the shop to itself', async () => {
      const shopify = shopifyApi(
        testConfig({
          domainTransformations: [
            {
              match: /^([a-zA-Z0-9][a-zA-Z0-9-_]*)\.myshopify\.io$/,
              transform: '$1.myshopify.io',
            },
          ],
        }),
      );
      queueMockResponse(JSON.stringify(successResponse));

      await shopify.auth.clientCredentials({shop, clientAssertion});

      expect(mockTestRequests.getRequest()!.url).toBe(
        `https://${shop}/admin/oauth/access_token`,
      );
      expect(mockRequestCapture.lastRequestInit!.redirect).toBe('manual');
    });

    test('leaves domain transformations working on the secret path', async () => {
      const shopify = shopifyApi(
        testConfig({
          domainTransformations: [
            {
              match: /^([a-zA-Z0-9][a-zA-Z0-9-_]*)\.myshopify\.io$/,
              transform: '$1.transformed.myshopify.io',
            },
          ],
        }),
      );
      queueMockResponse(JSON.stringify(successResponse));

      await shopify.auth.clientCredentials({shop});

      expect(mockTestRequests.getRequest()!.url).toBe(
        'https://test-shop.transformed.myshopify.io/admin/oauth/access_token',
      );
    });

    test('does not log the assertion or the secret', async () => {
      const logFn = jest.fn();
      const shopify = shopifyApi(
        testConfig({
          logger: {log: logFn, level: LogSeverity.Debug, httpRequests: true},
        }),
      );
      queueMockResponse(JSON.stringify(successResponse));

      await shopify.auth.clientCredentials({shop, clientAssertion});

      const messages = logFn.mock.calls.map(([_severity, message]) => message);
      expect(
        messages.some((message) => message.includes('Making HTTP request')),
      ).toBe(true);
      messages.forEach((message) => {
        expect(message).not.toContain(clientAssertion);
        expect(message).not.toContain(shopify.config.apiSecretKey);
        expect(message).not.toContain(successResponse.access_token);
      });
    });
  });

  describe('with an assertion from shopify.auth.createClientAssertion', () => {
    const successResponse = {
      access_token: 'some_access_token',
      scope: 'write_products,read_orders',
      expires_in: 3600,
    };
    const kid = 'production-2026-10';

    async function signingKeyPair(): Promise<CryptoKeyPair> {
      return (await crypto.subtle.generateKey(
        {name: 'ECDSA', namedCurve: 'P-256'},
        false,
        ['sign', 'verify'],
      )) as CryptoKeyPair;
    }

    test('sends the assertion it signed, for the host it is posting to', async () => {
      const shopify = shopifyApi(testConfig());
      const {privateKey, publicKey} = await signingKeyPair();

      const clientAssertion = await shopify.auth.createClientAssertion({
        shop,
        kid,
        privateKey,
      });

      queueMockResponse(JSON.stringify(successResponse));

      const {session} = await shopify.auth.clientCredentials({
        shop,
        clientAssertion,
      });

      const request = mockTestRequests.getRequest()!;
      const body = JSON.parse(request.body as string);

      expect(body.client_assertion).toBe(clientAssertion);
      expect(body.client_assertion_type).toBe(CLIENT_ASSERTION_TYPE);
      expect(body.client_id).toBe(shopify.config.apiKey);

      const {payload} = await jwtVerify(clientAssertion, publicKey, {
        algorithms: ['ES256'],
        audience: request.url,
        issuer: body.client_id,
        subject: body.client_id,
      });

      // The audience is the endpoint this very request went to, derived on both sides rather than
      // written down twice.
      expect(payload.aud).toBe(request.url);
      expect(session.accessToken).toBe(successResponse.access_token);
    });

    test('never sends the configured client secret, anywhere in the request', async () => {
      // A value that cannot occur by accident, so this fails loudly if the secret ever leaks onto
      // the assertion path.
      const sentinel = 'SENTINEL-SECRET-DO-NOT-SEND';
      const shopify = shopifyApi(testConfig({apiSecretKey: sentinel}));
      const {privateKey} = await signingKeyPair();

      const clientAssertion = await shopify.auth.createClientAssertion({
        shop,
        kid,
        privateKey,
      });

      queueMockResponse(JSON.stringify(successResponse));

      await shopify.auth.clientCredentials({shop, clientAssertion});

      const request = mockTestRequests.getRequest()!;

      expect(shopify.config.apiSecretKey).toBe(sentinel);
      expect(clientAssertion).not.toContain(sentinel);
      expect(
        JSON.stringify(decodeProtectedHeader(clientAssertion)),
      ).not.toContain(sentinel);
      expect(JSON.stringify(decodeJwt(clientAssertion))).not.toContain(
        sentinel,
      );
      expect(request.body as string).not.toContain(sentinel);
      expect(JSON.stringify(request.headers)).not.toContain(sentinel);
      expect(request.url).not.toContain(sentinel);
    });

    test('keeps the audience on the shop when a transformation routes elsewhere', async () => {
      const shopify = shopifyApi(
        testConfig({
          domainTransformations: [
            {
              match: /^([a-zA-Z0-9][a-zA-Z0-9-_]*)\.myshopify\.io$/,
              transform: '$1.transformed.myshopify.io',
            },
          ],
        }),
      );
      const {privateKey, publicKey} = await signingKeyPair();

      const clientAssertion = await shopify.auth.createClientAssertion({
        shop,
        kid,
        privateKey,
      });

      queueMockResponse(JSON.stringify(successResponse));

      await shopify.auth.clientCredentials({shop, clientAssertion});

      const request = mockTestRequests.getRequest()!;
      const {payload} = await jwtVerify(clientAssertion, publicKey);

      expect(request.url).toBe(
        'https://test-shop.transformed.myshopify.io/admin/oauth/access_token',
      );
      expect(payload.aud).toBe(`https://${shop}/admin/oauth/access_token`);
    });
  });

  describe('with any authentication mode', () => {
    const successResponse = {
      access_token: 'some_access_token',
      scope: 'write_products,read_orders',
      expires_in: 3600,
    };
    // Pinned so both authentication modes are proven to report the same thing.
    const redirectErrorMessage =
      'The access token endpoint returned a redirect, which this request does not follow. ' +
      'The credentials in this request were not sent to the redirect target. Check the shop ' +
      'domain and any configured domain transformations, and create a new client assertion if ' +
      'you are using one.';
    // The claim inverts on this path: the credentials are already gone.
    const followedRedirectErrorMessage =
      'The access token endpoint returned a redirect and the configured fetch implementation ' +
      'followed it. The credentials in this request may have been sent to the redirect target: ' +
      'treat them as exposed and rotate them if necessary, and make sure your setAbstractFetchFunc ' +
      "implementation honours redirect: 'manual'.";

    const authenticationModes: [
      string,
      Omit<ClientCredentialsParams, 'shop'>,
    ][] = [
      ['the client secret', {}],
      ['a client assertion', {clientAssertion: 'header.payload.signature'}],
    ];
    const redirectStatusCodes = [301, 302, 303, 307, 308];
    const redirectCases: [string, number, {clientAssertion?: string}][] =
      authenticationModes.flatMap(([mode, params]) =>
        redirectStatusCodes.map(
          (statusCode): [string, number, {clientAssertion?: string}] => [
            mode,
            statusCode,
            params,
          ],
        ),
      );

    test.each(authenticationModes)(
      'asks the adapter not to follow redirects when authenticating with %s',
      async (_mode, params) => {
        const shopify = shopifyApi(testConfig());
        queueMockResponse(JSON.stringify(successResponse));

        await shopify.auth.clientCredentials({shop, ...params});

        expect(mockRequestCapture.lastRequestInit!.redirect).toBe('manual');
      },
    );

    test.each(authenticationModes)(
      'throws when the fetch implementation followed a redirect while authenticating with %s',
      async (_mode, params) => {
        const shopify = shopifyApi(testConfig());
        const json = jest.fn(async () => successResponse);
        // What a fetch implementation that ignores `redirect: 'manual'` returns: the response of
        // the redirect target, which has already received the credentials.
        const followedRedirect = {
          type: 'basic',
          redirected: true,
          status: 200,
          statusText: 'OK',
          ok: true,
          headers: new Headers(),
          json,
        };
        const stubFetch = jest.fn(async () => followedRedirect);
        setAbstractFetchFunc(stubFetch as any);

        try {
          const error = await shopify.auth
            .clientCredentials({shop, ...params})
            .then(
              () => null,
              (caught: ShopifyErrors.HttpResponseError) => caught,
            );

          expect(error).toBeInstanceOf(ShopifyErrors.HttpResponseError);
          expect(error!.message).toBe(followedRedirectErrorMessage);
          expect(json).not.toHaveBeenCalled();
        } finally {
          setAbstractFetchFunc(mockFetch);
        }
      },
    );

    test.each(authenticationModes)(
      'accepts a response that reports it was not redirected while authenticating with %s',
      async (_mode, params) => {
        const shopify = shopifyApi(testConfig());
        const stubFetch = jest.fn(async () => ({
          type: 'basic',
          redirected: false,
          status: 200,
          statusText: 'OK',
          ok: true,
          headers: new Headers(),
          json: async () => successResponse,
        }));
        setAbstractFetchFunc(stubFetch as any);

        try {
          const {session} = await shopify.auth.clientCredentials({
            shop,
            ...params,
          });

          expect(session.accessToken).toBe(successResponse.access_token);
        } finally {
          setAbstractFetchFunc(mockFetch);
        }
      },
    );

    test.each(redirectCases)(
      'throws the redirect error when authenticating with %s and the endpoint returns %i',
      async (_mode, statusCode, params) => {
        const shopify = shopifyApi(testConfig());
        queueMockResponse('', {
          statusCode,
          statusText: 'Redirect',
          headers: {
            Location: 'https://other.example.com/admin/oauth/access_token',
          },
        });

        const error = await shopify.auth
          .clientCredentials({shop, ...params})
          .then(
            () => null,
            (caught: ShopifyErrors.HttpResponseError) => caught,
          );

        expect(error).toBeInstanceOf(ShopifyErrors.HttpResponseError);
        expect(error!.message).toBe(redirectErrorMessage);
        expect(error!.response.code).toBe(statusCode);
        expect(mockTestRequests.requestList).toHaveLength(1);
        expect(mockTestRequests.requestList[0].url).toBe(
          `https://${shop}/admin/oauth/access_token`,
        );
      },
    );

    test.each(authenticationModes)(
      'rejects an opaque redirect without parsing its body when authenticating with %s',
      async (_mode, params) => {
        const shopify = shopifyApi(testConfig());
        const json = jest.fn(async () => {
          throw new Error('the opaque redirect body must not be parsed');
        });
        const opaqueRedirect = {
          type: 'opaqueredirect',
          status: 0,
          statusText: '',
          ok: false,
          headers: new Headers(),
          json,
        };
        const stubFetch = jest.fn(async () => opaqueRedirect);
        setAbstractFetchFunc(stubFetch as any);

        try {
          const error = await shopify.auth
            .clientCredentials({shop, ...params})
            .then(
              () => null,
              (caught: ShopifyErrors.HttpResponseError) => caught,
            );

          expect(error).toBeInstanceOf(ShopifyErrors.HttpResponseError);
          expect(error!.message).toBe(redirectErrorMessage);
          // A filtered response carries no status, so this is what consumers see. Documented in
          // clientcredentials.md, and pinned here.
          expect(error!.response.code).toBe(0);
          expect(error!.response.statusText).toBe('');
          expect(stubFetch).toHaveBeenCalledTimes(1);
          expect(json).not.toHaveBeenCalled();
        } finally {
          setAbstractFetchFunc(mockFetch);
        }
      },
    );

    test.each(authenticationModes)(
      'reports a non-JSON error body as an HttpResponseError while authenticating with %s',
      async (_mode, params) => {
        const shopify = shopifyApi(testConfig());
        queueMockResponse('<html><body>Bad gateway</body></html>', {
          statusCode: 502,
          statusText: 'Bad Gateway',
        });

        const error = await shopify.auth
          .clientCredentials({shop, ...params})
          .then(
            () => null,
            (caught: ShopifyErrors.HttpResponseError) => caught,
          );

        expect(error).toBeInstanceOf(ShopifyErrors.HttpResponseError);
        expect(error!.message).toContain('is not JSON');
        expect(error!.response.code).toBe(502);
        expect(error!.response.statusText).toBe('Bad Gateway');
      },
    );

    test.each(authenticationModes)(
      'returns the session when the endpoint answers without a redirect while authenticating with %s',
      async (_mode, params) => {
        const shopify = shopifyApi(testConfig());
        queueMockResponse(JSON.stringify(successResponse));

        const {session} = await shopify.auth.clientCredentials({
          shop,
          ...params,
        });

        expect(session.accessToken).toBe(successResponse.access_token);
        expect(session.scope).toBe(successResponse.scope);
      },
    );
  });
});
