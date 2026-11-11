import type {JwtPayload} from '@shopify/shopify-api';

import {shopifyApp} from '../../..';
import {
  APP_URL,
  BASE64_HOST,
  TEST_SHOP,
  getJwt,
  setUpValidSession,
  testConfig,
} from '../../../__test-helpers';
import {REAUTH_URL_HEADER} from '../../const';

const invalidClaims: [string, Record<string, unknown>][] = [
  ['checkout token', {iss: `https://${TEST_SHOP}/checkouts`, dest: TEST_SHOP}],
  [
    'checkout issuer with absolute destination',
    {iss: `https://${TEST_SHOP}/checkouts`},
  ],
  ['scheme-less checkout issuer', {iss: `${TEST_SHOP}/checkouts`}],
  ['missing destination', {dest: undefined}],
  ['null destination', {dest: null}],
  ['numeric destination', {dest: 123}],
  ['object destination', {dest: {hostname: TEST_SHOP}}],
  ['array destination', {dest: [`https://${TEST_SHOP}`]}],
  ['empty destination', {dest: ''}],
  ['malformed destination', {dest: 'https://['}],
  ['destination without slashes', {dest: `https:${TEST_SHOP}`}],
  ['destination with one slash', {dest: `https:/${TEST_SHOP}`}],
  ['destination with whitespace', {dest: ` https://${TEST_SHOP}`}],
  ['relative destination', {dest: '/admin'}],
  ['scheme-less destination', {dest: TEST_SHOP}],
  ['HTTP destination', {dest: `http://${TEST_SHOP}`}],
  ['FTP destination', {dest: `ftp://${TEST_SHOP}`}],
  ['destination credentials', {dest: `https://user:password@${TEST_SHOP}`}],
  ['destination path', {dest: `https://${TEST_SHOP}/checkouts`}],
  ['destination query', {dest: `https://${TEST_SHOP}?shop=other`}],
  ['destination fragment', {dest: `https://${TEST_SHOP}#admin`}],
  ['missing issuer', {iss: undefined}],
  ['null issuer', {iss: null}],
  ['numeric issuer', {iss: 123}],
  ['object issuer', {iss: {hostname: TEST_SHOP}}],
  ['array issuer', {iss: [`https://${TEST_SHOP}/admin`]}],
  ['empty issuer', {iss: ''}],
  ['malformed issuer', {iss: 'https://['}],
  ['HTTP issuer', {iss: `http://${TEST_SHOP}/admin`}],
  ['issuer without admin path', {iss: `https://${TEST_SHOP}`}],
  ['issuer with admin path prefix', {iss: `https://${TEST_SHOP}/admin/other`}],
  ['issuer query', {iss: `https://${TEST_SHOP}/admin?other=1`}],
  ['mismatched issuer shop', {iss: 'https://other-shop.myshopify.com/admin'}],
  [
    'mismatched scheme-less issuer shop',
    {iss: 'other-shop.myshopify.com/admin'},
  ],
  ['mismatched destination shop', {dest: 'https://other-shop.myshopify.com'}],
];

function tokenRequest(token: string, transport: string) {
  const url = new URL(APP_URL);
  url.searchParams.set('shop', TEST_SHOP);
  url.searchParams.set('host', BASE64_HOST);
  url.searchParams.set('embedded', '1');
  const headers = new Headers({Origin: 'https://other-origin.example'});
  if (transport === 'header') {
    headers.set('Authorization', `Bearer ${token}`);
  } else {
    url.searchParams.set('id_token', token);
  }
  return new Request(url, {headers});
}

function expectInvalidResponse(
  response: Response,
  transport: string,
  retry = false,
) {
  expect(response).toBeInstanceOf(Response);
  expect(response.status).toBe(transport === 'header' ? 401 : 302);
  expect(response.headers.get('X-Shopify-Retry-Invalid-Session-Request')).toBe(
    transport === 'header' && retry ? '1' : null,
  );
  expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
  expect(response.headers.get('Access-Control-Allow-Headers')).toBe(
    'Authorization, Content-Type',
  );
  expect(response.headers.get('Access-Control-Expose-Headers')).toBe(
    REAUTH_URL_HEADER,
  );
  if (transport === 'query') {
    const bounce = new URL(response.headers.get('Location')!, APP_URL);
    expect(bounce.pathname).toBe('/auth/session-token');
    expect(bounce.searchParams.has('id_token')).toBe(false);
    const reload = new URL(bounce.searchParams.get('shopify-reload')!);
    expect(reload.searchParams.has('id_token')).toBe(false);
    expect(reload.searchParams.get('shop')).toBe(TEST_SHOP);
  }
}

describe.each(['header', 'query'])(
  'admin session token claims via %s',
  (transport) => {
    it.each(invalidClaims)(
      'rejects %s before loading a session or exchanging tokens',
      async (_name, claims) => {
        const shopify = shopifyApp(testConfig());
        const loadSession = jest.spyOn(shopify.sessionStorage, 'loadSession');
        const {token} = await getJwt(claims as Partial<JwtPayload>);

        const response = await shopify.authenticate
          .admin(tokenRequest(token, transport))
          .catch((error) => error);

        expectInvalidResponse(response, transport);
        expect(loadSession).not.toHaveBeenCalled();
        expect(fetch).not.toHaveBeenCalled();
      },
    );

    it.each([
      ['audience', {aud: 'other-app'}],
      ['expiry', {exp: Math.floor(Date.now() / 1000) - 60}],
      ['not-before', {nbf: Math.floor(Date.now() / 1000) + 60}],
      ['signature', {}],
    ] as [string, Partial<JwtPayload>][])(
      'preserves %s verification and retry behavior',
      async (claim, overrides) => {
        const shopify = shopifyApp(testConfig());
        const loadSession = jest.spyOn(shopify.sessionStorage, 'loadSession');
        let {token} = await getJwt(overrides);
        if (claim === 'signature') {
          const parts = token.split('.');
          parts[2] = `${parts[2][0] === 'a' ? 'b' : 'a'}${parts[2].slice(1)}`;
          token = parts.join('.');
        }

        const response = await shopify.authenticate
          .admin(tokenRequest(token, transport))
          .catch((error) => error);

        expectInvalidResponse(response, transport, true);
        expect(loadSession).not.toHaveBeenCalled();
        expect(fetch).not.toHaveBeenCalled();
      },
    );

    it.each([
      {iss: `${TEST_SHOP}/admin`, dest: `https://${TEST_SHOP}`},
      {iss: `https://${TEST_SHOP}/admin`, dest: `https://${TEST_SHOP}`},
      {iss: `https://${TEST_SHOP}/admin`, dest: `https://${TEST_SHOP}/`},
    ])('accepts admin claims %s', async (claims) => {
      const shopify = shopifyApp(testConfig());
      const testSession = await setUpValidSession(shopify.sessionStorage);
      const {token, payload} = await getJwt(claims);

      const {session, sessionToken} = await shopify.authenticate.admin(
        tokenRequest(token, transport),
      );

      expect(session).toBe(testSession);
      expect(sessionToken).toEqual(payload);
    });

    it('validates the audience before validating admin claims', async () => {
      const shopify = shopifyApp(testConfig());
      const {token} = await getJwt({
        dest: TEST_SHOP,
        iss: `https://${TEST_SHOP}/checkouts`,
        aud: 'other-app',
      });

      const response = await shopify.authenticate
        .admin(tokenRequest(token, transport))
        .catch((error) => error);

      expectInvalidResponse(response, transport, true);
    });

    it('does not hide unrelated session storage errors', async () => {
      const shopify = shopifyApp(testConfig());
      const error = new TypeError('Synthetic session storage failure');
      jest
        .spyOn(shopify.sessionStorage, 'loadSession')
        .mockRejectedValue(error);
      const {token} = await getJwt();

      await expect(
        shopify.authenticate.admin(tokenRequest(token, transport)),
      ).rejects.toBe(error);
    });
  },
);
