import {redirect} from '@remix-run/server-runtime';

import {BasicParams, LoginError, LoginErrorType} from '../../types';

export function loginFactory(params: BasicParams) {
  const {api, config, logger} = params;

  return async function login(request: Request): Promise<LoginError | never> {
    const url = new URL(request.url);
    const shopParam = url.searchParams.get('shop');

    if (request.method === 'GET' && !shopParam) {
      return {};
    }

    const shop: string | null =
      shopParam || ((await request.formData()).get('shop') as string);

    if (!shop) {
      logger.debug('Missing shop parameter', {shop});
      return {shop: LoginErrorType.MissingShop};
    }

    const shopWithoutProtocol = shop
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '');
    const shopWithDomain =
      shop?.indexOf('.') === -1
        ? `${shopWithoutProtocol}.myshopify.com`
        : shopWithoutProtocol;
    const sanitizedShop = api.utils.sanitizeShop(shopWithDomain);

    if (!sanitizedShop) {
      logger.debug('Invalid shop parameter', {shop});
      return {shop: LoginErrorType.InvalidShop};
    }

    const redirectUrl = `${config.appUrl}${config.auth.path}?shop=${sanitizedShop}`;

    logger.info(`Redirecting login request to ${redirectUrl}`, {
      shop: sanitizedShop,
    });

    throw redirect(redirectUrl);
  };
}
