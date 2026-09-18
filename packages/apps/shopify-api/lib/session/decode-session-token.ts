import {
  IdTokenVerificationError,
  verifyIdToken,
} from '@shopify/shopify-app-native-spike';

import {ConfigInterface} from '../base-types';
import * as ShopifyErrors from '../error';
import {getHMACKey} from '../utils/get-hmac-key';

import {JwtPayload} from './types';

export interface DecodeSessionTokenOptions {
  checkAudience?: boolean;
}

export async function withJwtErrorHandling<T>(
  token: string,
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (!(error instanceof IdTokenVerificationError)) throw error;
    throw new ShopifyErrors.InvalidJwtError(
      error.reason === 'invalid_audience'
        ? 'Session token had invalid API key'
        : `Failed to parse session token '${token}': ${error.message}`,
    );
  }
}

export function decodeSessionToken(config: ConfigInterface) {
  return async (
    token: string,
    {checkAudience = true}: DecodeSessionTokenOptions = {},
  ): Promise<JwtPayload> =>
    withJwtErrorHandling(
      token,
      async () =>
        (await verifyIdToken({
          token,
          clientId: config.apiKey,
          secretKey: getHMACKey(config.apiSecretKey),
          checkAudience,
        })) as unknown as JwtPayload,
    );
}
