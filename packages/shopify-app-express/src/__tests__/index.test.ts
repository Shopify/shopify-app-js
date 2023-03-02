import {
  FeatureDeprecatedError,
  LogSeverity,
  ShopifyError,
} from '@shopify/shopify-api';

import {shopifyApp} from '../index';
import {SHOPIFY_EXPRESS_LIBRARY_VERSION} from '../version';

import {testConfig} from './test-helper';

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

  it('can create an app object', () => {
    const shopify = shopifyApp(testConfig);

    expect(shopify).toBeDefined();
    expect(shopify.api).toBeDefined();
    expect(shopify.api.config.apiKey).toBe(testConfig.api.apiKey);
  });

  it('fails with an invalid config', () => {
    expect(() => shopifyApp({} as any)).toThrowError(ShopifyError);
  });

  it('properly defaults missing configs based on env vars', () => {
    /* eslint-disable no-process-env */
    process.env.SHOPIFY_API_KEY = 'envKey';
    process.env.SHOPIFY_API_SECRET = 'envSecret';
    process.env.SCOPES = 'envScope1,envScope2';
    process.env.HOST = 'https://envHost';
    process.env.SHOP_CUSTOM_DOMAIN = '*.envCustomDomain';

    const shopify = shopifyApp({
      auth: testConfig.auth,
      webhooks: testConfig.webhooks,
      api: {
        logger: testConfig.api.logger,
      },
    });

    expect(shopify).toBeDefined();
    expect(shopify.api.config.apiKey).toEqual('envKey');
    expect(shopify.api.config.apiSecretKey).toEqual('envSecret');
    expect(shopify.api.config.scopes.toString()).toEqual('envScope1,envScope2');
    expect(shopify.api.config.hostName).toEqual('envHost');
    expect(shopify.api.config.hostScheme).toEqual('https');
    expect(shopify.api.config.customShopDomains).toEqual(['*.envCustomDomain']);
    /* eslint-enable no-process-env */
  });

  it('properly sets the package in log calls', async () => {
    const shopify = shopifyApp(testConfig);

    await shopify.config.logger.info('test');

    expect(shopify.api.config.logger.log).toHaveBeenCalledWith(
      LogSeverity.Info,
      '[shopify-app/INFO] test',
    );

    await shopify.config.logger.info('test', {extra: 'context'});

    expect(shopify.api.config.logger.log).toHaveBeenCalledWith(
      LogSeverity.Info,
      '[shopify-app/INFO] test | {extra: context}',
    );
  });

  it('properly logs deprecation messages', async () => {
    const shopify = shopifyApp(testConfig);

    await shopify.config.logger.deprecated('9999.0.0', 'test');

    expect(shopify.api.config.logger.log).toHaveBeenCalledWith(
      LogSeverity.Warning,
      '[shopify-app/WARNING] [Deprecated | 9999.0.0] test',
    );
  });

  it('throws when deprecation version is reached', async () => {
    const shopify = shopifyApp(testConfig);

    await expect(
      shopify.config.logger.deprecated(SHOPIFY_EXPRESS_LIBRARY_VERSION, 'test'),
    ).rejects.toThrow(FeatureDeprecatedError);
  });
});
