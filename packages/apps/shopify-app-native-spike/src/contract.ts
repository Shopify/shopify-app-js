import {runTokenExchange} from './exchange';
import type {
  ClientCredentials,
  NativeTokenExchangeResult,
  TokenExchangeConfig,
  TokenExchangeAccessToken,
  SendRequest,
} from './types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function validate(config: TokenExchangeConfig): string | undefined {
  if (!['online', 'offline'].includes(config?.accessMode)) {
    return `Expected access mode to be 'online' or 'offline', but got '${config?.accessMode ?? ''}'`;
  }
  const token = config.idToken;
  if (!isRecord(token))
    return 'Expected idToken to be an object with exchangeable, token, and claims properties';
  if (token.exchangeable !== true)
    return 'ID token is not exchangeable. Only App Home, Admin UI extension & POS UI Extension Id tokens can be exchanged.';
  if (typeof token.token !== 'string' || !token.token)
    return 'Expected idToken.token to be a non-empty string';
  const dest = token.claims?.dest;
  if (typeof dest !== 'string' || !dest)
    return 'Expected idToken.claims.dest to be a non-empty string';
  if (
    dest.trim() !== dest ||
    !/^(?:https:\/\/)?[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/.test(dest)
  ) {
    return "Expected idToken.claims.dest to be a valid shop URL (e.g., 'https://shop.myshopify.com' or 'shop.myshopify.com')";
  }
  if (config.expiring !== undefined && typeof config.expiring !== 'boolean')
    return 'Expected expiring to be a boolean';
  if (config.accessMode === 'online' && config.expiring === false)
    return 'The expiring parameter is only applicable to offline access tokens. Online tokens always expire.';
}

function expiration(seconds: unknown): string | null {
  if (seconds === undefined || seconds === null) return null;
  if (typeof seconds !== 'number' || !Number.isFinite(seconds) || seconds < 0)
    throw new Error('Invalid expiry');
  return new Date(Date.now() + seconds * 1000).toISOString();
}

function normalize(
  body: unknown,
  shop: string,
  accessMode: TokenExchangeConfig['accessMode'],
): TokenExchangeAccessToken {
  if (
    !isRecord(body) ||
    typeof body.access_token !== 'string' ||
    !body.access_token ||
    typeof body.scope !== 'string' ||
    (body.refresh_token !== undefined && typeof body.refresh_token !== 'string')
  )
    throw new Error('Invalid token response');
  const user = body.associated_user;
  if (
    user !== undefined &&
    (!isRecord(user) ||
      typeof user.id !== 'number' ||
      !Number.isSafeInteger(user.id))
  )
    throw new Error('Invalid user');
  return {
    shop,
    accessMode,
    token: body.access_token,
    scope: body.scope,
    expires: expiration(body.expires_in),
    refreshToken: (body.refresh_token as string | undefined) ?? null,
    refreshTokenExpires: expiration(body.refresh_token_expires_in),
    user:
      accessMode === 'online' && isRecord(user)
        ? {
            id: user.id as number,
            firstName: String(user.first_name ?? ''),
            lastName: String(user.last_name ?? ''),
            scope: String(body.associated_user_scope ?? ''),
            email: String(user.email ?? ''),
            accountOwner: Boolean(user.account_owner),
            locale: String(user.locale ?? ''),
            collaborator: Boolean(user.collaborator),
            emailVerified: Boolean(user.email_verified),
          }
        : null,
  };
}

export async function exchangeUsingTokenExchange(
  client: ClientCredentials,
  config: TokenExchangeConfig,
  fetch: SendRequest = globalThis.fetch.bind(globalThis),
): Promise<NativeTokenExchangeResult> {
  const response = (status: number) => ({status, body: '', headers: {}});
  const invalid = validate(config);
  if (invalid)
    return {
      ok: false,
      shop: null,
      accessToken: null,
      httpLogs: [],
      response: response(500),
      log: {code: 'configuration_error', detail: invalid},
    };
  const domain = String(config.idToken.claims.dest).replace(/^https:\/\//, '');
  const shop = domain.replace(/\.myshopify\.com$/, '');
  const outcome = await runTokenExchange(
    {
      ...client,
      shop: domain,
      token: config.idToken.token,
      requestedTokenType: `urn:shopify:params:oauth:token-type:${config.accessMode}-access-token`,
      expiring: config.expiring === false ? 0 : 1,
      headers: {
        'User-Agent': 'shopify-app-native-spike v0.0.0 | JavaScript 2022.0',
      },
    },
    fetch,
    {maxRetries: 2, redirect: 'manual'},
  );
  const result: NativeTokenExchangeResult = {
    ok: false,
    shop,
    accessToken: null,
    log: outcome.log,
    httpLogs: outcome.httpLogs,
    response: response(500),
  };
  if (outcome.kind === 'error') return result;
  if (outcome.response.status === 200) {
    try {
      result.accessToken = normalize(outcome.body, shop, config.accessMode);
      result.ok = true;
      result.response = response(200);
    } catch {
      result.log = {
        code: 'invalid_response',
        detail:
          'Token exchange returned an invalid response. Respond 500 Internal Server Error using the provided response.',
      };
      Object.assign(result.httpLogs[result.httpLogs.length - 1], result.log);
    }
  } else if (outcome.response.status === 429) {
    result.response = {
      status: 429,
      body: '{"error":"Too many requests"}',
      headers: {'Content-Type': 'application/json'},
    };
  } else if (outcome.log.code === 'invalid_subject_token') {
    result.response = config.invalidTokenResponse ?? response(401);
  } else if (outcome.log.code === 'success') {
    result.log = {
      code: 'exchange_error',
      detail:
        'Token exchange did not return HTTP 200. Respond 500 Internal Server Error using the provided response.',
    };
    Object.assign(result.httpLogs[result.httpLogs.length - 1], result.log);
  }
  return result;
}
