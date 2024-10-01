import {throwFailedRequest} from '../../clients/common';
import {ConfigInterface} from '../../base-types';
import {Session} from '../../session/session';
import {DataType} from '../../clients/types';
import {fetchRequestFactory} from '../../utils/fetch-request';

import {createSession} from './create-session';
import {AccessTokenResponse} from './types';
import { sanitizeShop } from 'lib/utils/shop-validator';

const RefreshTokenGrantType = 'refresh_token';

export interface RefreshAccessTokenParams {
  session: Session;
}

export type RefreshAccessToken = (
  params: RefreshAccessTokenParams,
) => Promise<{session: Session}>;

export function refreshAccessToken(
  config: ConfigInterface,
): RefreshAccessToken {
  return async ({session}: RefreshAccessTokenParams) => {
    console.log('💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥');
    console.log('refreshing access token')
    console.log('session', session);

    const body = {
      client_id: config.apiKey,
      client_secret: config.apiSecretKey,
      grant_type: RefreshTokenGrantType,
      refresh_token: session.refreshToken,
    };

    const cleanShop = sanitizeShop(config)(session.shop, true)!;
    console.log('cleanShop', cleanShop);
    console.log('💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥');


    const postResponse = await fetchRequestFactory(config)(
      `https://${cleanShop}/admin/oauth/access_token`,
      {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': DataType.JSON,
          Accept: DataType.JSON,
        },
      },
    );

    if (!postResponse.ok) {
      const error = await postResponse.json();
      console.log('💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥');
      console.log('refresh access token error');
      console.log(error);
      console.log('💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥');

      throwFailedRequest(error, false, postResponse);
    }

    const accessTokenResponse = await postResponse.json<AccessTokenResponse>();
    console.log('💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥');
    console.log('refresh access token response');
    console.log(accessTokenResponse);
    console.log('💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥');

    return {
      session: createSession({
        accessTokenResponse,
        shop: cleanShop,
        // We need to keep this as an empty string as our template DB schemas have this required
        state: '',
        config,
      }),
    };
  };
}
