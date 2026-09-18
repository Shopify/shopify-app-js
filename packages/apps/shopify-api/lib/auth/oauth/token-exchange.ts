import {exchangeToken} from '@shopify/shopify-app-native-spike';

import {throwFailedRequest} from '../../clients/common';
import {withJwtErrorHandling} from '../../session/decode-session-token';
import {getHMACKey} from '../../utils/get-hmac-key';
import {sanitizeShop} from '../../utils/shop-validator';
import {ConfigInterface} from '../../base-types';
import {Session} from '../../session/session';
import {fetchRequestFactory} from '../../utils/fetch-request';

import {createSession} from './create-session';
import {AccessTokenResponse} from './types';

export enum RequestedTokenType {
  OnlineAccessToken = 'urn:shopify:params:oauth:token-type:online-access-token',
  OfflineAccessToken = 'urn:shopify:params:oauth:token-type:offline-access-token',
}

export interface TokenExchangeParams {
  shop: string;
  sessionToken: string;
  requestedTokenType: RequestedTokenType;
  expiring?: boolean;
}

export type TokenExchange = (
  params: TokenExchangeParams,
) => Promise<{session: Session}>;

export function tokenExchange(config: ConfigInterface): TokenExchange {
  return async ({
    shop,
    sessionToken,
    requestedTokenType,
    expiring,
  }: TokenExchangeParams) => {
    const exchange = await withJwtErrorHandling(sessionToken, () =>
      exchangeToken<AccessTokenResponse>(
        {
          clientId: config.apiKey,
          clientSecret: config.apiSecretKey,
          secretKey: getHMACKey(config.apiSecretKey),
          shop,
          token: sessionToken,
          requestedTokenType,
          expiring,
        },
        {
          validateShop: (value) => sanitizeShop(config)(value, true)!,
          fetch: fetchRequestFactory(config),
        },
      ),
    );

    if (!exchange.ok) {
      throwFailedRequest(exchange.body, false, exchange.response);
    }

    return {
      session: createSession({
        accessTokenResponse: exchange.body,
        shop: exchange.shop,
        // We need to keep this as an empty string as our template DB schemas have this required
        state: '',
        config,
      }),
    };
  };
}
