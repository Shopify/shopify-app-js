import {redirectToAuth} from '../redirect-to-auth';

import {AuthBeginParams} from './types';

export async function authBegin({req, res, api, config}: AuthBeginParams) {
  config.logger.debug('Beginning OAuth process', {
    shop: req.query.shop as string,
  });

  await redirectToAuth({req, res, api, config});
}
