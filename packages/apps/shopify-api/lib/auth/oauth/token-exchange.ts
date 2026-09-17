import {executeTokenExchange} from '@shopify/shopify-app-native-spike/transport';

import {throwFailedRequest} from '../../clients/common';
import {decodeSessionToken} from '../../session/decode-session-token';
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
    await decodeSessionToken(config)(sessionToken);

    const cleanShop = sanitizeShop(config)(shop, true)!;
    const exchange = await executeTokenExchange(
      {
        clientId: config.apiKey,
        clientSecret: config.apiSecretKey,
        shopDomain: cleanShop,
        idToken: sessionToken,
        requestedTokenType,
        expiring: expiring ? '1' : '0',
      },
      fetchRequestFactory(config),
    );
    if (!exchange.ok) throw exchange.error;
    const postResponse = exchange.response;

    if (!postResponse.ok) {
      throwFailedRequest(await postResponse.json(), false, postResponse);
    }

    return {
      session: createSession({
        accessTokenResponse: await postResponse.json<AccessTokenResponse>(),
        shop: cleanShop,
        // We need to keep this as an empty string as our template DB schemas have this required
        state: '',
        config,
      }),
    };
  };
}
