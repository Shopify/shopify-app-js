import {LoginErrorType, shopifyApp} from '../../../index';
import {
  APP_URL,
  TEST_SHOP,
  getThrownResponse,
  testConfig,
} from '../../../__tests__/test-helper';

describe('login helper', () => {
  it('returns an empty errors object if GET and no shop param', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());
    const requestMock = {
      url: `${APP_URL}/auth/login`,
      method: 'GET',
    };

    // WHEN
    const errors = await shopify.login(requestMock as any as Request);

    // THEN
    expect(errors).toStrictEqual({});
  });

  it('does not access formData if method is GET', async () => {
    // GIVEN
    const formDataMock = jest.fn();
    const shopify = shopifyApp(testConfig());
    const requestMock = {
      url: `${APP_URL}/auth/login?shop=${TEST_SHOP}`,
      method: 'GET',
      formData: formDataMock,
    };

    // WHEN
    getThrownResponse(shopify.login, requestMock as any as Request);

    // THEN
    expect(formDataMock).not.toHaveBeenCalled();
  });

  it('returns an error if the shop parameter is missing', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());
    const requestMock = {
      url: `${APP_URL}/auth/login`,
      formData: async () => ({get: () => null}),
      method: 'POST',
    };

    // WHEN
    const errors = await shopify.login(requestMock as any as Request);

    // THEN
    expect(errors).toEqual({shop: LoginErrorType.MissingShop});
  });

  it.each([
    {urlShop: 'invalid.shop', formShop: null, method: 'GET'},
    {urlShop: null, formShop: 'invalid.shop', method: 'POST'},
  ])(
    'returns an error if the shop parameter is invalid: %s',
    async ({urlShop, formShop, method}) => {
      // GIVEN
      const shopify = shopifyApp(testConfig());
      const requestMock = {
        url: urlShop
          ? `${APP_URL}/auth/login?shop=${urlShop}`
          : `${APP_URL}/auth/login`,
        formData: async () => ({get: () => formShop}),
        method,
      };

      // WHEN
      const errors = await shopify.login(requestMock as any as Request);

      // THEN
      expect(errors).toEqual({shop: LoginErrorType.InvalidShop});
    },
  );

  it.each([
    {urlShop: null, formShop: TEST_SHOP, method: 'POST'},
    {urlShop: TEST_SHOP, formShop: null, method: 'GET'},
    {urlShop: null, formShop: 'test-shop', method: 'POST'},
    {urlShop: 'test-shop', formShop: null, method: 'GET'},
    {urlShop: null, formShop: 'test-shop.myshopify.com', method: 'POST'},
    {urlShop: 'test-shop.myshopify.com', formShop: null, method: 'GET'},
  ])(
    'returns a redirect to /auth if the shop is valid: %s',
    async ({urlShop, formShop, method}) => {
      // GIVEN
      const config = testConfig();
      const shopify = shopifyApp(testConfig());
      const requestMock = {
        url: urlShop
          ? `${APP_URL}/auth/login?shop=${urlShop}`
          : `${APP_URL}/auth/login`,
        formData: async () => ({get: () => formShop}),
        method,
      };

      // WHEN
      const response = await getThrownResponse(
        shopify.login,
        requestMock as any as Request,
      );

      // THEN
      expect(response.status).toEqual(302);
      expect(response.headers.get('location')).toEqual(
        `${APP_URL}/auth?shop=${TEST_SHOP}`,
      );
    },
  );

  it('sanitizes the shop parameter', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());
    const requestMock = {
      url: `${APP_URL}/auth/login`,
      formData: async () => ({get: () => `https://${TEST_SHOP}/`}),
      method: 'POST',
    };

    // WHEN
    const response = await getThrownResponse(
      shopify.login,
      requestMock as any as Request,
    );

    // THEN
    expect(response.status).toEqual(302);
    expect(response.headers.get('location')).toEqual(
      `${APP_URL}/auth?shop=${TEST_SHOP}`,
    );
  });
});
