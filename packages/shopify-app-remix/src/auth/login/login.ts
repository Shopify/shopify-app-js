import {redirect} from '@remix-run/server-runtime';

import {BasicParams, LoginError} from '../../types';

export function loginFactory(params: BasicParams) {
  const {api, config, logger} = params;

  return async function login(request: Request): Promise<LoginError | never> {
    const url = new URL(request.url);
    const formData = await request.formData();

    const shop: string | null = formData.get('shop')
      ? (formData.get('shop') as string)
      : url.searchParams.get('shop');

    if (!shop) {
      logger.debug('Missing shop parameter', {shop});
      return {errors: {shop: 'Missing shop parameter'}};
    }

    const shopWithDot =
      shop?.indexOf('.') === -1 ? `${shop}.myshopify.com` : shop;
    const sanitizedShop = api.utils.sanitizeShop(shopWithDot);

    if (!sanitizedShop) {
      logger.debug('Invalid shop parameter', {shop: shopWithDot});
      return {errors: {shop: 'Invalid shop parameter'}};
    }

    const redirectUrl = `${config.auth.path}?shop=${sanitizedShop}`;
    logger.info(`Redirecting login request to ${redirectUrl}`, {
      shop: sanitizedShop,
    });

    throw redirect(redirectUrl);
  };
}
