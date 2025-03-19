import querystring from 'querystring';

import * as ShopifyErrors from '../../../error';
import {
  generateLocalHmac,
  getCurrentTimeInSec,
} from '../../../utils/hmac-validator';
import {JwtPayload} from '../../../session/types';
import {nonce} from '../nonce';
import {
  Cookies,
  NormalizedRequest,
  NormalizedResponse,
} from '../../../../runtime/http';
import {queueMockResponse, signJWT} from '../../../__tests__/test-helper';
import {testConfig} from '../../../__tests__/test-config';
import {getOfflineId} from '../../../session/session-utils';
import {shopifyApi} from '../../..';

const VALID_NONCE = 'noncenoncenonce';
jest.mock('../nonce', () => ({nonce: jest.fn(() => VALID_NONCE)}));

type QueryMock = Record<string, any>;

let shop: string;

beforeEach(() => {
  shop = 'someshop.myshopify.io';
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('beginAuth', () => {
  let request: NormalizedRequest;

  beforeEach(() => {
    request = {
      method: 'GET',
      headers: {},
      url: 'https://my-test-app.myshopify.io/auth/begin',
    };
  });

  [
    {isOnline: true, type: `online`},
    {isOnline: false, type: 'offline'},
  ].forEach(({isOnline, type}) => {
    test(`sets cookie to state for ${type} access requests`, async () => {
      const shopify = shopifyApi(testConfig());

      const response: NormalizedResponse = await shopify.auth.begin({
        shop,
        isOnline,
        callbackPath: '/some-callback',
        rawRequest: request,
      });

      const cookies = new Cookies({} as NormalizedRequest, response, {
        keys: [shopify.config.apiSecretKey],
      });

      expect(nonce).toHaveBeenCalledTimes(1);
      expect(cookies.outgoingCookieJar.shopify_app_state.value).toEqual(
        VALID_NONCE,
      );
    });
  });

  test('returns the correct auth url for given info', async () => {
    const shopify = shopifyApi(testConfig());

    const response: NormalizedResponse = await shopify.auth.begin({
      shop,
      isOnline: false,
      callbackPath: '/some-callback',
      rawRequest: request,
    });

    const scopes = shopify.config.scopes
      ? shopify.config.scopes.toString()
      : '';

    const query = {
      client_id: shopify.config.apiKey,
      scope: scopes,
      redirect_uri: `${shopify.config.hostScheme}://${shopify.config.hostName}/some-callback`,
      state: VALID_NONCE,
      'grant_options[]': '',
    };
    const expectedQueryString = querystring.stringify(query);

    expect(response.statusCode).toBe(302);
    expect(response.headers?.Location).toBe(
      `https://${shop}/admin/oauth/authorize?${expectedQueryString}`,
    );
  });

  test('returns the correct auth url when the host scheme is http', async () => {
    const shopify = shopifyApi(testConfig({hostScheme: 'http'}));

    const response: NormalizedResponse = await shopify.auth.begin({
      shop,
      isOnline: false,
      callbackPath: '/some-callback',
      rawRequest: request,
    });
    const scopes = shopify.config.scopes
      ? shopify.config.scopes.toString()
      : '';

    const query = {
      client_id: shopify.config.apiKey,
      scope: scopes,
      redirect_uri: `http://${shopify.config.hostName}/some-callback`,
      state: VALID_NONCE,
      'grant_options[]': '',
    };
    const expectedQueryString = querystring.stringify(query);

    expect(response.statusCode).toBe(302);
    expect(response.headers?.Location).toBe(
      `https://${shop}/admin/oauth/authorize?${expectedQueryString}`,
    );
  });

  test('appends per_user access mode to url when isOnline is set to true', async () => {
    const shopify = shopifyApi(testConfig());

    const response: NormalizedResponse = await shopify.auth.begin({
      shop,
      isOnline: true,
      callbackPath: '/some-callback',
      rawRequest: request,
    });
    const scopes = shopify.config.scopes
      ? shopify.config.scopes.toString()
      : '';

    const query = {
      client_id: shopify.config.apiKey,
      scope: scopes,
      redirect_uri: `${shopify.config.hostScheme}://${shopify.config.hostName}/some-callback`,
      state: VALID_NONCE,
      'grant_options[]': 'per-user',
    };
    const expectedQueryString = querystring.stringify(query);

    expect(response.statusCode).toBe(302);
    expect(response.headers?.Location).toBe(
      `https://${shop}/admin/oauth/authorize?${expectedQueryString}`,
    );
  });

  test('response with a 410 when the request is a bot', async () => {
    const shopify = shopifyApi(testConfig());

    request.headers['User-Agent'] = 'Googlebot';

    const response: NormalizedResponse = await shopify.auth.begin({
      shop,
      isOnline: true,
      callbackPath: '/some-callback',
      rawRequest: request,
    });

    expect(response.statusCode).toBe(410);
  });

  test('fails to start if the app is private', () => {
    const shopify = shopifyApi(
      testConfig({isCustomStoreApp: true, adminApiAccessToken: 'dummy_token'}),
    );

    expect(
      shopify.auth.begin({
        shop,
        isOnline: true,
        callbackPath: '/some-callback',
        rawRequest: request,
      }),
    ).rejects.toThrow(ShopifyErrors.PrivateAppError);
  });
});

describe('callback', () => {
  let request: NormalizedRequest;

  beforeEach(() => {
    request = {
      method: 'GET',
      headers: {},
      url: '/auth/some-callback',
    };
  });

  test('fails to run if the app is private', () => {
    const shopify = shopifyApi(
      testConfig({isCustomStoreApp: true, adminApiAccessToken: 'dummy_token'}),
    );

    expect(shopify.auth.callback({rawRequest: request})).rejects.toThrow(
      ShopifyErrors.PrivateAppError,
    );
  });

  test("throws an error when receiving a callback for a shop that doesn't have a state cookie", async () => {
    const shopify = shopifyApi(testConfig());

    request.url += '?shop=I+do+not+exist';

    await expect(shopify.auth.callback({rawRequest: request})).rejects.toThrow(
      ShopifyErrors.CookieNotFound,
    );
  });

  test('throws error when callback includes invalid hmac', async () => {
    const shopify = shopifyApi(testConfig());

    const response: NormalizedResponse = await shopify.auth.begin({
      shop,
      isOnline: true,
      callbackPath: '/some-callback',
      rawRequest: request,
    });
    setCallbackCookieFromResponse(
      request,
      response,
      shopify.config.apiSecretKey,
    );

    const testCallbackQuery: QueryMock = {
      shop,
      state: VALID_NONCE,
      timestamp: getCurrentTimeInSec().toString(),
      code: 'some random auth code',
    };
    testCallbackQuery.hmac = 'definitely the wrong hmac';
    request.url += `?${new URLSearchParams(testCallbackQuery).toString()}`;

    await expect(shopify.auth.callback({rawRequest: request})).rejects.toThrow(
      ShopifyErrors.InvalidOAuthError,
    );
  });

  test('throws error when callback includes invalid state', async () => {
    const shopify = shopifyApi(testConfig());

    const response: NormalizedResponse = await shopify.auth.begin({
      shop,
      isOnline: true,
      callbackPath: '/some-callback',
      rawRequest: request,
    });
    setCallbackCookieFromResponse(
      request,
      response,
      shopify.config.apiSecretKey,
    );

    const testCallbackQuery: QueryMock = {
      shop,
      state: 'incorrect state',
      timestamp: getCurrentTimeInSec().toString(),
      code: 'some random auth code',
    };
    const expectedHmac = await generateLocalHmac(shopify.config)(
      testCallbackQuery,
    );
    testCallbackQuery.hmac = expectedHmac;
    request.url += `?${new URLSearchParams(testCallbackQuery).toString()}`;

    await expect(shopify.auth.callback({rawRequest: request})).rejects.toThrow(
      ShopifyErrors.InvalidOAuthError,
    );
  });

  test('requests access token for valid callbacks with offline access and creates session', async () => {
    const shopify = shopifyApi(testConfig());

    const beginResponse: NormalizedResponse = await shopify.auth.begin({
      shop,
      isOnline: false,
      callbackPath: '/some-callback',
      rawRequest: request,
    });
    setCallbackCookieFromResponse(
      request,
      beginResponse,
      shopify.config.apiSecretKey,
    );

    const testCallbackQuery: QueryMock = {
      shop,
      state: VALID_NONCE,
      timestamp: getCurrentTimeInSec().toString(),
      code: 'some random auth code',
    };
    const expectedHmac = await generateLocalHmac(shopify.config)(
      testCallbackQuery,
    );
    testCallbackQuery.hmac = expectedHmac;
    request.url += `?${new URLSearchParams(testCallbackQuery).toString()}`;

    const scopes = shopify.config.scopes
      ? shopify.config.scopes.toString()
      : '';

    const successResponse = {
      access_token: 'some access token string',
      scope: scopes,
    };

    queueMockResponse(JSON.stringify(successResponse));

    const callbackResponse = await shopify.auth.callback({rawRequest: request});
    if (!callbackResponse) {
      fail('Callback response is undefined');
    }
    const expectedId = `offline_${shop}`;
    const responseCookies = Cookies.parseCookies(
      callbackResponse.headers['Set-Cookie'],
    );
    expect(responseCookies.shopify_app_session.value).toEqual(expectedId);
    expect(callbackResponse.session.accessToken).toBe(
      successResponse.access_token,
    );
  });

  test('requests access token for valid callbacks with online access and creates session with expiration and onlineAccessInfo', async () => {
    const shopify = shopifyApi(testConfig());

    const beginResponse: NormalizedResponse = await shopify.auth.begin({
      shop,
      isOnline: true,
      callbackPath: '/some-callback',
      rawRequest: request,
    });
    setCallbackCookieFromResponse(
      request,
      beginResponse,
      shopify.config.apiSecretKey,
    );

    const testCallbackQuery: QueryMock = {
      shop,
      state: VALID_NONCE,
      timestamp: getCurrentTimeInSec().toString(),
      code: 'some random auth code',
    };
    const expectedHmac = await generateLocalHmac(shopify.config)(
      testCallbackQuery,
    );
    testCallbackQuery.hmac = expectedHmac;
    request.url += `?${new URLSearchParams(testCallbackQuery).toString()}`;

    const successResponse = {
      access_token: 'some access token',
      scope: 'pet_kitties, walk_dogs',
      expires_in: '525600',
      associated_user_scope: 'pet_kitties',
      associated_user: {
        id: '8675309',
        first_name: 'John',
        last_name: 'Smith',
        email: 'john@example.com',
        email_verified: true,
        account_owner: true,
        locale: 'en',
        collaborator: true,
      },
    };

    queueMockResponse(JSON.stringify(successResponse));

    const callbackResponse = await shopify.auth.callback({rawRequest: request});

    const responseCookies = Cookies.parseCookies(
      callbackResponse.headers['Set-Cookie'],
    );
    expect(responseCookies.shopify_app_session.value).toEqual(
      expect.stringMatching(
        /^[a-f0-9]{8,}-[a-f0-9]{4,}-[a-f0-9]{4,}-[a-f0-9]{4,}-[a-f0-9]{12,}/,
      ),
    );
    expect(callbackResponse.session.accessToken).toBe(
      successResponse.access_token,
    );
  });

  test('does not set an OAuth cookie for online, embedded apps', async () => {
    const shopify = shopifyApi(testConfig({isEmbeddedApp: true}));

    const beginResponse: NormalizedResponse = await shopify.auth.begin({
      shop,
      isOnline: true,
      callbackPath: '/some-callback',
      rawRequest: request,
    });
    setCallbackCookieFromResponse(
      request,
      beginResponse,
      shopify.config.apiSecretKey,
    );

    const successResponse = {
      access_token: 'some access token',
      scope: 'pet_kitties, walk_dogs',
      expires_in: 525600,
      associated_user_scope: 'pet_kitties',
      associated_user: {
        id: '1',
        first_name: 'John',
        last_name: 'Smith',
        email: 'john@example.com',
        email_verified: true,
        account_owner: true,
        locale: 'en',
        collaborator: true,
      },
    };
    const testCallbackQuery: QueryMock = {
      shop,
      state: VALID_NONCE,
      timestamp: getCurrentTimeInSec().toString(),
      code: 'some random auth code',
    };
    const expectedHmac = await generateLocalHmac(shopify.config)(
      testCallbackQuery,
    );
    testCallbackQuery.hmac = expectedHmac;
    request.url += `?${new URLSearchParams(testCallbackQuery).toString()}`;

    queueMockResponse(JSON.stringify(successResponse));

    const callbackResponse = await shopify.auth.callback({rawRequest: request});

    const jwtPayload: JwtPayload = {
      iss: `https://${shop}/admin`,
      dest: `https://${shop}`,
      aud: shopify.config.apiKey,
      sub: '1',
      exp:
        new Date(Date.now() + successResponse.expires_in * 1000).getTime() /
        1000,
      nbf: 1234,
      iat: 1234,
      jti: '4321',
      sid: 'abc123',
    };

    const jwtSessionId = `${shop}_${jwtPayload.sub}`;

    // Simulate a subsequent JWT request to see if the session is loaded as the current one
    const token = await signJWT(shopify.config.apiSecretKey, jwtPayload);
    const jwtReq = {
      method: 'GET',
      url: 'https://my-test-app.myshopify.io/totally-real-request',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    } as NormalizedRequest;

    const currentSessionId = await shopify.session.getCurrentId({
      isOnline: true,
      rawRequest: jwtReq,
    });
    expect(currentSessionId).toEqual(jwtSessionId);

    const responseCookies = Cookies.parseCookies(
      callbackResponse.headers['Set-Cookie'],
    );
    expect(responseCookies.shopify_app_session).toBeUndefined();
  });

  test('properly updates the OAuth cookie for online, non-embedded apps', async () => {
    const shopify = shopifyApi(testConfig({isEmbeddedApp: false}));

    const beginResponse: NormalizedResponse = await shopify.auth.begin({
      shop,
      isOnline: true,
      callbackPath: '/some-callback',
      rawRequest: request,
    });
    setCallbackCookieFromResponse(
      request,
      beginResponse,
      shopify.config.apiSecretKey,
    );

    const successResponse = {
      access_token: 'some access token',
      scope: 'pet_kitties, walk_dogs',
      expires_in: 525600,
      associated_user_scope: 'pet_kitties',
      associated_user: {
        id: '1',
        first_name: 'John',
        last_name: 'Smith',
        email: 'john@example.com',
        email_verified: true,
        account_owner: true,
        locale: 'en',
        collaborator: true,
      },
    };
    const testCallbackQuery: QueryMock = {
      shop,
      state: VALID_NONCE,
      timestamp: getCurrentTimeInSec().toString(),
      code: 'some random auth code',
    };
    const expectedHmac = await generateLocalHmac(shopify.config)(
      testCallbackQuery,
    );
    testCallbackQuery.hmac = expectedHmac;
    request.url += `?${new URLSearchParams(testCallbackQuery).toString()}`;

    queueMockResponse(JSON.stringify(successResponse));

    const callbackResponse = await shopify.auth.callback({rawRequest: request});

    const responseCookies = Cookies.parseCookies(
      callbackResponse.headers['Set-Cookie'],
    );

    const cookieId = responseCookies.shopify_app_session!.value;
    const expectedExpiration = new Date(
      Date.now() + successResponse.expires_in * 1000,
    ).getTime();

    expect(cookieId).toEqual(
      expect.stringMatching(
        /^[a-f0-9]{8,}-[a-f0-9]{4,}-[a-f0-9]{4,}-[a-f0-9]{4,}-[a-f0-9]{12,}/,
      ),
    );
    expect(callbackResponse.session.id).toEqual(cookieId);
    expect(callbackResponse.session.accessToken).toBe(
      successResponse.access_token,
    );
    expect(callbackResponse.session?.expires?.getTime()).toBeWithinSecondsOf(
      expectedExpiration,
      1,
    );
    expect(
      responseCookies.shopify_app_session.expires?.getTime(),
    ).toBeWithinSecondsOf(expectedExpiration, 1);
  });

  test('does not set an OAuth cookie for offline, embedded apps', async () => {
    const shopify = shopifyApi(testConfig({isEmbeddedApp: true}));

    const beginResponse: NormalizedResponse = await shopify.auth.begin({
      shop,
      isOnline: false,
      callbackPath: '/some-callback',
      rawRequest: request,
    });
    setCallbackCookieFromResponse(
      request,
      beginResponse,
      shopify.config.apiSecretKey,
    );

    const successResponse = {
      access_token: 'some access token',
      scope: 'pet_kitties, walk_dogs',
    };
    const testCallbackQuery: QueryMock = {
      shop,
      state: VALID_NONCE,
      timestamp: getCurrentTimeInSec().toString(),
      code: 'some random auth code',
    };
    const expectedHmac = await generateLocalHmac(shopify.config)(
      testCallbackQuery,
    );
    testCallbackQuery.hmac = expectedHmac;
    request.url += `?${new URLSearchParams(testCallbackQuery).toString()}`;

    queueMockResponse(JSON.stringify(successResponse));

    const callbackResponse = await shopify.auth.callback({rawRequest: request});

    const responseCookies = Cookies.parseCookies(
      callbackResponse.headers['Set-Cookie'],
    );

    expect(callbackResponse.session.id).toEqual(
      getOfflineId(shopify.config)(shop),
    );
    expect(callbackResponse.session.expires?.getTime()).toBeUndefined();

    expect(responseCookies.shopify_app_session).toBeUndefined();
  });

  test('callback throws an error when the request is done by a bot', async () => {
    const shopify = shopifyApi(testConfig());

    const botRequest = {
      method: 'GET',
      url: 'https://my-test-app.myshopify.io/totally-real-request',
      headers: {
        'User-Agent': 'Googlebot',
      },
    } as NormalizedRequest;

    await expect(
      shopify.auth.callback({
        rawRequest: botRequest,
      }),
    ).rejects.toThrow(ShopifyErrors.BotActivityDetected);
  });
  test('create Session without setting an OAuth cookie for expiring offline tokens, embedded apps', async () => {
    const shopify = shopifyApi(testConfig({isEmbeddedApp: true}));

    const beginResponse: NormalizedResponse = await shopify.auth.begin({
      shop,
      isOnline: false,
      callbackPath: '/some-callback',
      rawRequest: request,
    });
    setCallbackCookieFromResponse(
      request,
      beginResponse,
      shopify.config.apiSecretKey,
    );

    const successResponse = {
      access_token: 'some access token',
      scope: 'pet_kitties, walk_dogs',
      expires_in: 525600,
    };
    const expectedExpiration = new Date(
      Date.now() + successResponse.expires_in * 1000,
    ).getTime();
    const testCallbackQuery: QueryMock = {
      shop,
      state: VALID_NONCE,
      timestamp: getCurrentTimeInSec().toString(),
      code: 'some random auth code',
    };
    const expectedHmac = await generateLocalHmac(shopify.config)(
      testCallbackQuery,
    );
    testCallbackQuery.hmac = expectedHmac;
    request.url += `?${new URLSearchParams(testCallbackQuery).toString()}`;

    queueMockResponse(JSON.stringify(successResponse));

    const callbackResponse = await shopify.auth.callback({rawRequest: request});

    const responseCookies = Cookies.parseCookies(
      callbackResponse.headers['Set-Cookie'],
    );

    expect(callbackResponse.session).toEqual(
      expect.objectContaining({
        id: getOfflineId(shopify.config)(shop),
        isOnline: false,
        accessToken: successResponse.access_token,
        scope: successResponse.scope,
        shop,
        state: VALID_NONCE,
      }),
    );
    expect(callbackResponse.session.expires?.getTime()).toBeWithinSecondsOf(
      expectedExpiration,
      1,
    );

    expect(responseCookies.shopify_app_session).toBeUndefined();
  });
  test('properly updates the OAuth cookie for offline, non-embedded apps', async () => {
    const shopify = shopifyApi(testConfig({isEmbeddedApp: false}));

    const beginResponse: NormalizedResponse = await shopify.auth.begin({
      shop,
      isOnline: false,
      callbackPath: '/some-callback',
      rawRequest: request,
    });
    setCallbackCookieFromResponse(
      request,
      beginResponse,
      shopify.config.apiSecretKey,
    );

    const successResponse = {
      access_token: 'some access token',
      scope: 'pet_kitties, walk_dogs',
    };
    const testCallbackQuery: QueryMock = {
      shop,
      state: VALID_NONCE,
      timestamp: getCurrentTimeInSec().toString(),
      code: 'some random auth code',
    };
    const expectedHmac = await generateLocalHmac(shopify.config)(
      testCallbackQuery,
    );
    testCallbackQuery.hmac = expectedHmac;
    request.url += `?${new URLSearchParams(testCallbackQuery).toString()}`;

    queueMockResponse(JSON.stringify(successResponse));

    const callbackResponse = await shopify.auth.callback({rawRequest: request});

    const responseCookies = Cookies.parseCookies(
      callbackResponse.headers['Set-Cookie'],
    );
    const cookieId = responseCookies.shopify_app_session!.value;

    expect(callbackResponse.session.id).toEqual(cookieId);
    expect(callbackResponse.session.id).toEqual(
      getOfflineId(shopify.config)(shop),
    );
    expect(callbackResponse.session.expires?.getTime()).toBeUndefined();
    expect(
      responseCookies.shopify_app_session.expires?.getTime(),
    ).toBeUndefined();
  });
});

function setCallbackCookieFromResponse(
  request: NormalizedRequest,
  response: NormalizedResponse,
  apiSecretKey: string,
) {
  // Set the oauth begin state cookie as the request here
  const responseCookies = new Cookies({} as NormalizedRequest, response, {
    keys: [apiSecretKey],
  });

  request.headers.Cookie = [
    `shopify_app_state=${responseCookies.outgoingCookieJar.shopify_app_state.value}`,
    `shopify_app_state.sig=${responseCookies.outgoingCookieJar['shopify_app_state.sig'].value}`,
  ].join(';');
}
