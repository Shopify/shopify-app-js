import {Session} from '../../../session/session';
import {ConfigInterface} from '../../../base-types';
import {logger} from '../../../logger';
import {getCustomerAccountSessionId} from '../../../session/session-utils';
import {sanitizeShop} from '../../../utils/shop-validator';

import {CustomerAccountTokenResponse} from './types';

export function createCustomerAccountSession(config: ConfigInterface) {
  return async function createCustomerAccountSession({
    tokenResponse,
    shop,
    state,
  }: {
    tokenResponse: CustomerAccountTokenResponse;
    shop: string;
    state: string;
  }): Promise<Session> {
    const log = logger(config);
    log.info('Creating new customer account session', {shop});

    // Extract customer ID from the ID token (simplified for this example)
    // In a real implementation, you would properly decode and validate the JWT
    const customerId = extractCustomerIdFromIdToken(tokenResponse.id_token);

    const cleanShop = sanitizeShop(config)(shop, true)!;
    const sessionId = getCustomerAccountSessionId(config)(
      cleanShop,
      customerId,
    );

    const getSessionExpiration = (expires_in: number) =>
      new Date(Date.now() + expires_in * 1000);

    const session = new Session({
      id: sessionId,
      shop: cleanShop,
      state,
      isOnline: true,
      accessToken: tokenResponse.access_token,
      idToken: tokenResponse.id_token,
      refreshToken: tokenResponse.refresh_token,
      scope: 'customer-account-api:full',
      expires: getSessionExpiration(tokenResponse.expires_in),
    });

    log.debug('Customer account session created', {shop, sessionId});

    return session;
  };
}

// Simplified customer ID extraction - in production you'd properly decode/validate the JWT
function extractCustomerIdFromIdToken(idToken: string): string {
  try {
    // This is a simplified implementation for demo purposes
    // In production, you should use a proper JWT library to decode and validate
    const payload = JSON.parse(
      Buffer.from(idToken.split('.')[1], 'base64').toString(),
    );
    return payload.sub || 'unknown';
  } catch (error) {
    // Fallback to a random identifier if we can't extract the customer ID
    return crypto.randomUUID();
  }
}
