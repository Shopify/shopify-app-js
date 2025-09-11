import {testConfig} from '../../../../__tests__/test-config';
import {LogSeverity, ApiVersion} from '../../../../types';
import {shopifyApi} from '../../../..';

import {restResources} from './test-resources';

describe('Load REST resources', () => {
  it('sets up objects with a client', async () => {
    const shopify = shopifyApi(testConfig({restResources}));

    expect(shopify.rest).toHaveProperty('FakeResource');
    expect(shopify.rest.FakeResource.Client).toBeDefined();
  });

  it('warns if the API versions mismatch', async () => {
    const shopify = shopifyApi(
      testConfig({restResources, apiVersion: '2020-01' as any as ApiVersion}),
    );

    expect(shopify.config.logger.log).toHaveBeenCalledWith(
      LogSeverity.Warning,
      expect.stringContaining(
        `Loading REST resources for API version ${ApiVersion.July25}, which doesn't match the default 2020-01`,
      ),
    );

    expect(shopify.rest).toHaveProperty('FakeResource');
    expect(shopify.rest.FakeResource.Client).toBeDefined();
  });
});
