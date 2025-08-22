import {BasicParams, AppDistribution} from '../../../types';

import {redirectToShopifyOrAppRoot} from './redirect-to-shopify-or-app-root';

export const ensureAppIsEmbeddedIfRequired = async (
  params: BasicParams,
  request: Request,
) => {
  const {api, logger, config} = params;
  const url = new URL(request.url);

  const shop = url.searchParams.get('shop')!;

  if (
    config.distribution !== AppDistribution.ShopifyAdmin &&
    url.searchParams.get('embedded') !== '1'
  ) {
    logger.debug('App is not embedded, redirecting to Shopify', {shop});
    await redirectToShopifyOrAppRoot(request, {api, logger, config});
  }
};
