import {shopifyApp} from '../../../index';
import {
  APP_URL,
  TEST_SHOP,
  getThrownResponse,
  testConfig,
} from '../../../__tests__/test-helper';

describe('login helper', () => {
  it('returns an error if the shop parameter is missing', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());
    const requestMock = {
      url: `${APP_URL}/auth/login`,
      formData: async () => ({get: () => null}),
    };

    // WHEN
    const errors = await shopify.login(requestMock as any as Request);

    // THEN
    expect(errors).toEqual({errors: {shop: 'Missing shop parameter'}});
  });

  it.each([
    {urlShop: 'invalid.shop', formShop: null},
    {urlShop: null, formShop: 'invalid.shop'},
  ])(
    'returns an error if the shop parameter is invalid: %s',
    async ({urlShop, formShop}) => {
      // GIVEN
      const shopify = shopifyApp(testConfig());
      const requestMock = {
        url: urlShop
          ? `${APP_URL}/auth/login?shop=${urlShop}`
          : `${APP_URL}/auth/login`,
        formData: async () => ({get: () => formShop}),
      };

      // WHEN
      const errors = await shopify.login(requestMock as any as Request);

      // THEN
      expect(errors).toEqual({errors: {shop: 'Invalid shop parameter'}});
    },
  );

  it.each([
    {urlShop: null, formShop: TEST_SHOP},
    {urlShop: TEST_SHOP, formShop: null},
    {urlShop: null, formShop: 'test-shop'},
    {urlShop: 'test-shop', formShop: null},
  ])(
    'returns a redirect to /auth if the shop is valid: %s',
    async ({urlShop, formShop}) => {
      // GIVEN
      const shopify = shopifyApp(testConfig());
      const requestMock = {
        url: urlShop
          ? `${APP_URL}/auth/login?shop=${urlShop}`
          : `${APP_URL}/auth/login`,
        formData: async () => ({get: () => formShop}),
      };

      // WHEN
      const response = await getThrownResponse(
        shopify.login,
        requestMock as any as Request,
      );

      // THEN
      expect(response.status).toEqual(302);
      expect(response.headers.get('location')).toEqual(
        `/auth?shop=${TEST_SHOP}`,
      );
    },
  );
});
