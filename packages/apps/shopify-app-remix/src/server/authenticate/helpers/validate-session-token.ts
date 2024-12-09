import {JwtPayload} from '@shopify/shopify-api';

import type {BasicParams} from '../../types';

import {respondToInvalidSessionToken} from './respond-to-invalid-session-token';
import {getShopFromRequest} from './get-shop-from-request';

interface ValidateSessionTokenOptions {
  checkAudience?: boolean;
}

export async function validateSessionToken(
  params: BasicParams,
  request: Request,
  token: string,
  {checkAudience = true}: ValidateSessionTokenOptions = {},
): Promise<JwtPayload> {
  const {api, logger} = params;
  logger.debug('Validating session token', {shop: getShopFromRequest(request)});

  try {
    const payload = await api.session.decodeSessionToken(token, {
      checkAudience,
    });
    const dest = new URL(payload.dest);
    const shop = dest.hostname;
    logger.debug('Session token is valid - validated', {
      shop,
      payload: JSON.stringify(payload),
    });

    return payload;
  } catch (error) {
    logger.debug(`Failed to validate session token: ${error.message}`, {
      shop: getShopFromRequest(request),
    });

    throw respondToInvalidSessionToken({params, request, retryRequest: true});
  }
}
