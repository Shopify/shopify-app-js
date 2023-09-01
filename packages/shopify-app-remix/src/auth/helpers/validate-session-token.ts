import {JwtPayload} from '@shopify/shopify-api';

import type {BasicParams} from '../../types';

class InvalidSessionTokenError extends Error {
  originalError: Error;

  constructor(message: string, {originalError}: {originalError: Error}) {
    super(message);
    this.originalError = originalError;
  }
}

export async function validateSessionToken(
  {api, logger}: BasicParams,
  token: string,
): Promise<JwtPayload> {
  logger.debug('Validating session token');

  try {
    const payload = await api.session.decodeSessionToken(token);
    logger.debug('Session token is valid', {
      payload: JSON.stringify(payload),
    });

    return payload;
  } catch (error) {
    logger.error(`Failed to validate session token: ${error.message}`);
    throw new InvalidSessionTokenError(error.message, {originalError: error});
  }
}
