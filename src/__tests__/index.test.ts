import {shopifyApp} from '../index';

import {testConfig} from './test-helper';

describe('shopifyApp', () => {
  it('can create an app object', () => {
    const shopify = shopifyApp(testConfig);

    expect(shopify).toBeDefined();
    expect(shopify.api).toBeDefined();
    expect(shopify.api.config.apiKey).toBe(testConfig.api.apiKey);
  });
});
