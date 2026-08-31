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
/** Treat a token as expired this many ms early, to absorb clock skew and flight time. */
const EXPIRY_SKEW_MS = 60_000;
/** Used only when the token is not a decodable JWT and the body has no `expires_in`. */
const FALLBACK_TTL_MS = 300_000;
/** Avoid repeated token mint requests during a short authentication failure. */
const TOKEN_FAILURE_TTL_MS = 1_000;

export interface GlobalApiToken {
  accessToken: string;
  expiresAt: Date;
  scopes: string[];
}

export interface GlobalApiClientCredentialsParams {
  /** Mint a new token even if a valid one is cached. */
  forceRefresh?: boolean;
}

export type GlobalApiClientCredentials = (
  params?: GlobalApiClientCredentialsParams,
) => Promise<{token: GlobalApiToken}>;

const tokenCache = new WeakMap<ConfigInterface, GlobalApiToken>();
const tokenRequests = new WeakMap<ConfigInterface, Promise<GlobalApiToken>>();
const tokenFailures = new WeakMap<
  ConfigInterface,
  {error: unknown; expiresAt: number}
>();
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
  tokenCache.set(config, token);
  return token;
}

function isUsableToken(
  token: GlobalApiToken | undefined,
): token is GlobalApiToken {
  return (
    token !== undefined &&
    token.expiresAt.getTime() - Date.now() > EXPIRY_SKEW_MS
  );
}

function requestGlobalApiToken(
  config: ConfigInterface,
): Promise<GlobalApiToken> {
  const inFlight = tokenRequests.get(config);
  if (inFlight) {
    return inFlight;
  }

  const failure = tokenFailures.get(config);
  if (failure) {
    if (failure.expiresAt > Date.now()) {
      return Promise.reject(failure.error);
    }
    tokenFailures.delete(config);
  }

  const request = mintGlobalApiToken(config);
  tokenRequests.set(config, request);
  void request.then(
    () => {
      tokenFailures.delete(config);
      if (tokenRequests.get(config) === request) {
        tokenRequests.delete(config);
      }
    },
    (error) => {
      tokenFailures.set(config, {
        error,
        expiresAt: Date.now() + TOKEN_FAILURE_TTL_MS,
      });
      if (tokenRequests.get(config) === request) {
        tokenRequests.delete(config);
      }
    },
  );
  return request;
}

export async function getGlobalApiToken(
  config: ConfigInterface,
  {forceRefresh = false}: GlobalApiClientCredentialsParams = {},
): Promise<GlobalApiToken> {
  const cached = tokenCache.get(config);
  if (!forceRefresh && isUsableToken(cached)) {
    return cached;
  }

  return requestGlobalApiToken(config);
}

export function clearGlobalApiTokenIfMatches(
  config: ConfigInterface,
  accessToken: string,
): void {
  const cached = tokenCache.get(config);
  if (cached?.accessToken === accessToken) {
    tokenCache.delete(config);
  }
}

export async function refreshGlobalApiToken(
  config: ConfigInterface,
  rejectedAccessToken: string,
): Promise<GlobalApiToken> {
  const cached = tokenCache.get(config);
  if (cached?.accessToken === rejectedAccessToken) {
    clearGlobalApiTokenIfMatches(config, rejectedAccessToken);
  } else if (isUsableToken(cached)) {
    return cached;
  }

  return getGlobalApiToken(config, {forceRefresh: true});
}

export function globalApiClientCredentials(
  config: ConfigInterface,
): GlobalApiClientCredentials {
  return async (params) => ({
    token: await getGlobalApiToken(config, params),
  });
}
