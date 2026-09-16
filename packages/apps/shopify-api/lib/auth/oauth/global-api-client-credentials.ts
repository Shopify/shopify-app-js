import {decodeJwt} from 'jose';

import {ConfigInterface} from '../../base-types';
import {getUserAgent, throwFailedRequest} from '../../clients/common';
import {DataType} from '../../clients/types';
import {ShopifyError} from '../../error';
import {Method} from '../../types';
import {fetchRequestFactory} from '../../utils/fetch-request';
import {readJsonBody} from '../../utils/read-json-body';

export const GLOBAL_API_TOKEN_PATH = '/auth/access_token';
const CLIENT_CREDENTIALS_GRANT_TYPE = 'client_credentials';
/** Used only when the token is not a decodable JWT and the body has no `expires_in`. */
const FALLBACK_TTL_MS = 300_000;

export interface GlobalApiToken {
  accessToken: string;
  expiresAt: Date;
  scopes: string[];
}

export type GlobalApiClientCredentials = () => Promise<{token: GlobalApiToken}>;

async function mintGlobalApiToken(
  config: ConfigInterface,
): Promise<GlobalApiToken> {
  const response = await fetchRequestFactory(config)(
    `${config.globalApiUrl}${GLOBAL_API_TOKEN_PATH}`,
    {
      method: Method.Post,
      logBody: false,
      headers: {
        'Content-Type': DataType.JSON,
        Accept: DataType.JSON,
        'User-Agent': getUserAgent(config),
      },
      body: JSON.stringify({
        client_id: config.apiKey,
        client_secret: config.apiSecretKey,
        grant_type: CLIENT_CREDENTIALS_GRANT_TYPE,
      }),
    },
  );
  const body = await readJsonBody(response);

  if (!response.ok) {
    throwFailedRequest(body, false, response);
  }

  const accessToken = body.access_token;
  if (typeof accessToken !== 'string' || accessToken.length === 0) {
    throw new ShopifyError(
      'Global API token response did not include an access_token',
    );
  }

  let claims: Record<string, unknown> | undefined;
  try {
    claims = decodeJwt(accessToken) as Record<string, unknown>;
  } catch {
    claims = undefined;
  }

  const exp =
    typeof claims?.exp === 'number' && Number.isFinite(claims.exp)
      ? claims.exp
      : undefined;
  const expiresIn =
    typeof body.expires_in === 'number' && Number.isFinite(body.expires_in)
      ? body.expires_in
      : undefined;
  const expiresAt =
    expiresIn !== undefined
      ? new Date(Date.now() + expiresIn * 1000)
      : exp !== undefined
        ? new Date(exp * 1000)
        : new Date(Date.now() + FALLBACK_TTL_MS);

  // The documented response field is `scope` (singular, space-separated); the JWT claim
  // is `scopes` (plural) and is used only when the response has no scope field.
  const rawScopes =
    typeof body.scope === 'string'
      ? body.scope
      : typeof claims?.scopes === 'string'
        ? claims.scopes
        : undefined;
  const scopes = rawScopes ? rawScopes.split(' ').filter(Boolean) : [];

  const token = {accessToken, expiresAt, scopes};
  return token;
}

export function globalApiClientCredentials(
  config: ConfigInterface,
): GlobalApiClientCredentials {
  return async () => ({token: await mintGlobalApiToken(config)});
}
