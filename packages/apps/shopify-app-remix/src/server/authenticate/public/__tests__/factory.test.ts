import {shopifyApp} from '../../..';
import {
  APP_URL,
  getJwt,
  getThrownResponse,
  testConfig,
} from '../../../__test-helpers';

describe('Authenticate.public', () => {
  describe('when v3_authenticatePublic is not set and authenticate.public() is called', () => {
    it('logs that authenticate.public() is deprecated', async () => {
      // GIVEN
      const config = testConfig({
        future: {
          v3_authenticatePublic: false,
        },
      });
      const shopify = shopifyApp(config);
      const {token} = getJwt();

      // WHEN
      await shopify.authenticate.public(
        new Request(APP_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      );

      // THEN
      expect(config.logger?.log).toHaveBeenCalledWith(
        expect.any(Number),
        expect.stringContaining(
          'authenticate.public() will be deprecated in v3. Use authenticate.public.checkout() instead.',
        ),
      );
    });

    it('returns token when successful', async () => {
      // GIVEN
      const shopify = shopifyApp(
        testConfig({
          future: {
            v3_authenticatePublic: false,
          },
        }),
      );
      const {token, payload} = getJwt();

      // WHEN
      const {sessionToken} = await shopify.authenticate.public(
        new Request(APP_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      );

      // THEN
      expect(sessionToken).toMatchObject(payload);
    });

    it('sets extra CORS allowed headers when requested from a different origin', async () => {
      // GIVEN
      const shopify = shopifyApp(
        testConfig({
          future: {
            v3_authenticatePublic: false,
          },
        }),
      );
      const {token} = getJwt();

      // WHEN
      const {cors} = await shopify.authenticate.public(
        new Request(APP_URL, {
          headers: {
            Origin: 'https://some-other.origin',
            Authorization: `Bearer ${token}`,
          },
        }),
        {corsHeaders: ['Content-Type', 'X-Extra-Header']},
      );
      const response = cors(new Response());

      // THEN
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe(
        'Authorization, Content-Type, X-Extra-Header',
      );
    });

    it('responds to preflight requests', async () => {
      // GIVEN
      const shopify = shopifyApp(
        testConfig({
          future: {
            v3_authenticatePublic: false,
          },
        }),
      );
      const {token} = getJwt();

      // WHEN
      const response = await getThrownResponse(
        shopify.authenticate.public,
        new Request(APP_URL, {
          method: 'OPTIONS',
          headers: {Authorization: `Bearer ${token}`},
        }),
      );

      // THEN
      expect(response.status).toBe(204);
    });

    it('responds to preflight requests from a different origin with extra CORS allowed headers', async () => {
      // GIVEN
      const shopify = shopifyApp(
        testConfig({
          future: {
            v3_authenticatePublic: false,
          },
        }),
      );
      const {token} = getJwt();
      const request = new Request(APP_URL, {
        method: 'OPTIONS',
        headers: {
          Origin: 'https://some-other.origin',
          Authorization: `Bearer ${token}`,
        },
      });

      // WHEN
      const response = await getThrownResponse(
        async (request) =>
          shopify.authenticate.public(request, {
            corsHeaders: ['X-Extra-Header'],
          }),
        request,
      );

      // THEN
      expect(response.status).toBe(204);
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe(
        'Authorization, Content-Type, X-Extra-Header',
      );
    });

    it('throws a 401 on missing Authorization bearer token', async () => {
      // GIVEN
      const shopify = shopifyApp(
        testConfig({
          future: {
            v3_authenticatePublic: false,
          },
        }),
      );

      // WHEN
      const response = await getThrownResponse(
        shopify.authenticate.public,
        new Request(APP_URL),
      );

      // THEN
      expect(response.status).toBe(401);
    });

    it('throws a 401 on invalid Authorization bearer token', async () => {
      // GIVEN
      const shopify = shopifyApp(
        testConfig({
          future: {
            v3_authenticatePublic: false,
          },
        }),
      );

      // WHEN
      const response = await getThrownResponse(
        shopify.authenticate.public,
        new Request(APP_URL, {
          headers: {Authorization: `Bearer this_is_not_a_valid_token`},
        }),
      );

      // THEN
      expect(response.status).toBe(401);
    });

    it('rejects bot requests', async () => {
      // GIVEN
      const shopify = shopifyApp(
        testConfig({
          future: {
            v3_authenticatePublic: false,
          },
        }),
      );

      // WHEN
      const response = await getThrownResponse(
        shopify.authenticate.public,
        new Request(APP_URL, {
          headers: {'User-Agent': 'Googlebot'},
        }),
      );

      // THEN
      expect(response.status).toBe(410);
    });
  });

  describe('when v3_authenticatePublic is true', () => {
    it('authenticate.public is an object not a function', async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig());

      // THEN
      expect(typeof shopify.authenticate.public).toBe('object');
    });
  });
});
