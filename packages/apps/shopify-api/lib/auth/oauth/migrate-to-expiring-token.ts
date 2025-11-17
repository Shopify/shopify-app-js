import {ConfigInterface} from '../../base-types';
import {throwFailedRequest} from '../../clients/common';
import {DataType} from '../../clients/types';
import {Session} from '../../session/session';
import {fetchRequestFactory} from '../../utils/fetch-request';
import {sanitizeShop} from '../../utils/shop-validator';

import {createSession} from './create-session';
import {RequestedTokenType} from './token-exchange';
import {AccessTokenResponse} from './types';

const TokenExchangeGrantType =
  'urn:ietf:params:oauth:grant-type:token-exchange';

export interface MigrateToExpiringTokenParams {
  shop: string;
  nonExpiringOfflineAccessToken: string;
}

export type MigrateToExpiringToken = (
  params: MigrateToExpiringTokenParams,
) => Promise<{session: Session}>;

export function migrateToExpiringToken(
  config: ConfigInterface,
): MigrateToExpiringToken {
  return async ({
    shop,
    nonExpiringOfflineAccessToken,
  }: MigrateToExpiringTokenParams) => {
    const body = {
      client_id: config.apiKey,
      client_secret: config.apiSecretKey,
      grant_type: TokenExchangeGrantType,
      subject_token: nonExpiringOfflineAccessToken,
      subject_token_type: RequestedTokenType.OfflineAccessToken,
      requested_token_type: RequestedTokenType.OfflineAccessToken,
      expiring: '1',
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
