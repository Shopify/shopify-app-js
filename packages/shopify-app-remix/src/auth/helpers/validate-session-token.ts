import {JwtPayload} from '@shopify/shopify-api';

import type {BasicParams} from '../../types';

interface ValidateSessionTokenOptions {
  checkAudience?: boolean;
}

export async function validateSessionToken(
  {api, logger}: BasicParams,
  token: string,
  {checkAudience = true}: ValidateSessionTokenOptions = {},
): Promise<JwtPayload> {
  logger.debug('Validating session token');

  try {
    const payload = await api.session.decodeSessionToken(token, {
      checkAudience,
    });
    logger.debug('Session token is valid', {
      payload: JSON.stringify(payload),
    });

    return payload;
  } catch (error) {
    logger.debug(`Failed to validate session token: ${error.message}`);
    throw new Response(undefined, {
      status: 401,
      statusText: 'Unauthorized',
    });
  }
}
