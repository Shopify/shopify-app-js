import {ShopifyError} from '@shopify/shopify-api';
import * as shopifyApiPackage from '@shopify/shopify-api';

import {
  shopifyApp,
  LATEST_API_VERSION as APP_LATEST_API_VERSION,
  LogSeverity,
  DeliveryMethod,
  BillingInterval,
  AppDistribution,
  ApiVersion,
} from '../index';
import {AppConfigArg} from '../config-types';

import {TEST_SHOP, setUpValidSession, testConfig} from './test-helper';
import {mockExternalRequest} from './request-mock';

const REQUEST_URL = `https://${TEST_SHOP}/admin/api/${shopifyApiPackage.LATEST_API_VERSION}/customers.json`;

describe('shopifyApp', () => {
  /* eslint-disable no-process-env */
  const oldEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {...oldEnv};
  });

  afterAll(() => {
    process.env = oldEnv;
  });
  /* eslint-enable no-process-env */

  it('can create shopify object', () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());

    // THEN
    expect(shopify).toBeDefined();
  });

  it('has login function when distribution is not ShopifyAdmin', () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());

    // THEN
    expect(shopify.login).toBeDefined();
  });

  it('does not have login function when distribution is ShopifyAdmin', () => {
    // GIVEN
    const shopify = shopifyApp({
      ...testConfig(),
      distribution: AppDistribution.ShopifyAdmin,
    });

    // THEN
    expect(shopify).not.toHaveProperty('login');
  });

  it('fails with an invalid config', () => {
    expect(() => shopifyApp({} as any)).toThrowError(ShopifyError);
  });

  it("fixes the port if it's not set", () => {
    // GIVEN
    jest.spyOn(shopifyApiPackage, 'shopifyApi');
    // eslint-disable-next-line no-process-env
    process.env.PORT = '1234';

    // WHEN
    shopifyApp(testConfig({appUrl: 'http://localhost'}));

    // THEN
    expect(shopifyApiPackage.shopifyApi).toHaveBeenCalledWith(
      expect.objectContaining({
        appUrl: 'http://localhost:1234',
      }),
    );
  });

  it('applies user agent prefix', () => {
    // GIVEN
    jest.spyOn(shopifyApiPackage, 'shopifyApi');
    const config = testConfig({
      userAgentPrefix: 'test',
    });

    // WHEN
    shopifyApp(config);

    // THEN
    const {userAgentPrefix} = (shopifyApiPackage.shopifyApi as any).mock
      .calls[1][0];

    expect(userAgentPrefix).toMatch(
      /^test \| Shopify Remix Library v[0-9]+\.[0-9]+\.[0-9]+(-rc.[0-9]+)?$/,
    );
  });

  it('properly re-exports required @shopify/shopify-api imports', () => {
    // This test doesn't actually test anything, but it's here to make sure that we're actually importing the values
    const imports = [
      APP_LATEST_API_VERSION,
      LogSeverity,
      DeliveryMethod,
      BillingInterval,
      ApiVersion,
    ];

    expect(imports).not.toContain(undefined);
  });

  it('fails if no session storage is given', () => {
    // GIVEN
    const config: AppConfigArg = testConfig({sessionStorage: undefined});
    delete (config as any).sessionStorage;

    // THEN
    expect(() => shopifyApp(config)).toThrowError(ShopifyError);
  });

  describe('unauthenticated admin context', () => {
    it('REST client can perform GET requests', async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig());
      await setUpValidSession(shopify.sessionStorage, false);
      const {admin} = await shopify.unauthenticated.admin(TEST_SHOP);

      await mockExternalRequest({
        request: new Request(REQUEST_URL),
        response: new Response(JSON.stringify({customers: []})),
      });

      // WHEN
      const response = await admin.rest.get({path: 'customers'});

      // THEN
      expect(response.status).toEqual(200);
      expect(await response.json()).toEqual({customers: []});
    });

    it('REST client can perform POST requests', async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig());
      await setUpValidSession(shopify.sessionStorage, false);
      const {admin} = await shopify.unauthenticated.admin(TEST_SHOP);

      await mockExternalRequest({
        request: new Request(REQUEST_URL, {method: 'POST'}),
        response: new Response(JSON.stringify({customers: []})),
      });

      // WHEN
      const response = await admin.rest.post({
        path: '/customers.json',
        data: '',
      });

      // THEN
      expect(response.status).toEqual(200);
      expect(await response.json()).toEqual({customers: []});
    });

    it('REST client can perform PUT requests', async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig());
      await setUpValidSession(shopify.sessionStorage, false);
      const {admin} = await shopify.unauthenticated.admin(TEST_SHOP);

      await mockExternalRequest({
        request: new Request(REQUEST_URL, {method: 'PUT'}),
        response: new Response(JSON.stringify({customers: []})),
      });

      // WHEN
      const response = await admin.rest.put({
        path: '/customers.json',
        data: '',
      });

      // THEN
      expect(response.status).toEqual(200);
      expect(await response.json()).toEqual({customers: []});
    });

    it('REST client can perform DELETE requests', async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig());
      await setUpValidSession(shopify.sessionStorage, false);
      const {admin} = await shopify.unauthenticated.admin(TEST_SHOP);

      await mockExternalRequest({
        request: new Request(REQUEST_URL, {method: 'DELETE'}),
        response: new Response(JSON.stringify({customers: []})),
      });

      // WHEN
      const response = await admin.rest.delete({path: '/customers.json'});

      // THEN
      expect(response.status).toEqual(200);
      expect(await response.json()).toEqual({customers: []});
    });

    it('GraphQL client can perform requests', async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig());
      await setUpValidSession(shopify.sessionStorage, false);
      const {admin} = await shopify.unauthenticated.admin(TEST_SHOP);

      await mockExternalRequest({
        request: new Request(
          `https://${TEST_SHOP}/admin/api/${shopifyApiPackage.LATEST_API_VERSION}/graphql.json`,
          {method: 'POST'},
        ),
        response: new Response(JSON.stringify({shop: {name: 'Test shop'}})),
      });

      // WHEN
      const response = await admin.graphql('{ shop { name } }');

      // THEN
      expect(response.status).toEqual(200);
      expect(await response.json()).toEqual({shop: {name: 'Test shop'}});
    });
  });
});
