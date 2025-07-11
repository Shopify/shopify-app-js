import {BasicParams, AppDistribution} from '../../../types';

import {redirectToBouncePage} from './redirect-to-bounce-page';

const SESSION_TOKEN_PARAM = 'id_token';

export const ensureSessionTokenSearchParamIfRequired = async (
  params: BasicParams,
  request: Request,
) => {
  const {logger, config} = params;
  const url = new URL(request.url);

  const shop = url.searchParams.get('shop')!;
  const searchParamSessionToken = url.searchParams.get(SESSION_TOKEN_PARAM);
  const isEmbedded = url.searchParams.get('embedded') === '1';

  if (
    config.distribution !== AppDistribution.ShopifyAdmin &&
    isEmbedded &&
    !searchParamSessionToken
  ) {
    logger.debug(
      'Missing session token in search params, going to bounce page',
      {shop},
    );
    redirectToBouncePage(params, url);
  }
};
