import {JwtPayload} from '@shopify/shopify-api';

import type {BasicParams} from '../../types';

interface ValidateSessionTokenOptions {
  checkAudience?: boolean;
}

export async function validateSessionToken(
  params: BasicParams,
  token: string,
  {checkAudience = true}: ValidateSessionTokenOptions = {},
): Promise<JwtPayload> {
  const {logger} = params;
  logger.debug('Validating session token');

  try {
    return await validateSessionTokenUncaught(params, token, {checkAudience});
  } catch (error) {
    logger.debug(`Failed to validate session token: ${error.message}`);
    throw new Response(undefined, {
      status: 401,
      statusText: 'Unauthorized',
    });
  }
}

export async function validateSessionTokenUncaught(
  {api, logger}: BasicParams,
  token: string,
  {checkAudience = true}: ValidateSessionTokenOptions = {},
): Promise<JwtPayload> {
  logger.debug('Validating session token');

  console.log('BEFORE');
  const payload = await api.session.decodeSessionToken(token, {
    checkAudience,
  });
  console.log('AFTER');

  logger.debug('Session token is valid', {
    payload: JSON.stringify(payload),
  });

  return payload;
}
