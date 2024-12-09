import {JwtPayload} from '@shopify/shopify-api';

import type {BasicParams} from '../../types';

import {respondToInvalidSessionToken} from './respond-to-invalid-session-token';

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
    logger.debug(`Failed to validate session token: ${error.message}`);

    throw respondToInvalidSessionToken({params, request, retryRequest: true});
  }
}
