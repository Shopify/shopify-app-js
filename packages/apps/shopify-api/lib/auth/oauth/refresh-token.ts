import {ConfigInterface} from '../../base-types';
import {throwFailedRequest} from '../../clients/common';
import {DataType} from '../../clients/types';
import {Session} from '../../session/session';
import {fetchRequestFactory} from '../../utils/fetch-request';
import {sanitizeShop} from '../../utils/shop-validator';

import {createSession} from './create-session';
import {AccessTokenResponse} from './types';

export interface RefreshTokenParams {
  shop: string;
  refreshToken: string;
}

export type RefreshToken = (
  params: RefreshTokenParams,
) => Promise<{session: Session}>;

const RefreshTokenGrantType = 'refresh_token';

export function refreshToken(config: ConfigInterface): RefreshToken {
  return async ({shop, refreshToken}: RefreshTokenParams) => {
    const body = {
      client_id: config.apiKey,
      client_secret: config.apiSecretKey,
      refresh_token: refreshToken,
      grant_type: RefreshTokenGrantType,
    };

    const cleanShop = sanitizeShop(config)(shop, true)!;

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
