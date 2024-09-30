import {throwFailedRequest} from '../../clients/common';
import {ConfigInterface} from '../../base-types';
import {Session} from '../../session/session';
import {DataType} from '../../clients/types';
import {fetchRequestFactory} from '../../utils/fetch-request';

import {createSession} from './create-session';
import {AccessTokenResponse} from './types';

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
    const body = {
      client_id: config.apiKey,
      client_secret: config.apiSecretKey,
      grant_type: RefreshTokenGrantType,
      refresh_token: session.refreshToken,
    };

    const postResponse = await fetchRequestFactory(config)(
      `https://${session.shop}/admin/oauth/access_token`,
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
        shop: session.shop,
        // We need to keep this as an empty string as our template DB schemas have this required
        state: '',
        config,
      }),
    };
  };
}
