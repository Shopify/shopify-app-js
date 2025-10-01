import {ConfigInterface} from '../../../base-types';
import * as ShopifyErrors from '../../../error';
import {logger} from '../../../logger';
import {fetchRequestFactory} from '../../../utils/fetch-request';

import {DiscoveryEndpoints} from './types';

export function discoverAuthEndpoints(config: ConfigInterface) {
  return async function discoverAuthEndpoints(
    shop: string,
  ): Promise<DiscoveryEndpoints> {
    const discoveryUrl = `https://${shop}/.well-known/openid-configuration`;

    const log = logger(config);
    log.debug('Discovering Customer Account OAuth endpoints', {
      shop,
      discoveryUrl,
    });

    const fetchRequest = fetchRequestFactory(config);
    const response = await fetchRequest(discoveryUrl);

    if (!response.ok) {
      throw new ShopifyErrors.HttpRequestError(
        'Failed to discover Customer Account OAuth endpoints',
      );
    }

    const endpoints: DiscoveryEndpoints = await response.json();
    return endpoints;
  };
}
