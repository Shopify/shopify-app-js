import {executeTokenExchange} from './transport';
import type {
  HttpLog,
  Log,
  ResponseDetails,
  TokenExchangeAccessToken,
  TokenExchangeConfig,
  TokenExchangeResult,
} from './types';

export type {TokenExchangeConfig, TokenExchangeResult} from './types';

const details = {
  success:
    'Token exchange successful. Store the access token and proceed with business logic.',
  invalid_subject_token:
    'The ID token is invalid. Respond 401 Unauthorized using the provided response.',
  invalid_client:
    'Client credentials are invalid or the app has been uninstalled. Respond 500 Internal Server Error using the provided response.',
  network_error:
    'Network error occurred during token exchange. Respond 500 Internal Server Error using the provided response.',
  rate_limit_exceeded:
    'Max retries reached after rate limiting. Respond 429 Too Many Requests using the provided response.',
};

function response(status: number): ResponseDetails {
  return {status, body: '', headers: {}};
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function validate(config: TokenExchangeConfig): string | undefined {
  if (!['online', 'offline'].includes(config?.accessMode)) {
    return `Expected access mode to be 'online' or 'offline', but got '${config?.accessMode ?? ''}'`;
  }
  const token = config.idToken;
  if (!isRecord(token)) {
    return 'Expected idToken to be an object with exchangeable, token, and claims properties';
  }
  if (token.exchangeable !== true) {
    return 'ID token is not exchangeable. Only App Home, Admin UI extension & POS UI Extension Id tokens can be exchanged.';
  }
  if (typeof token.token !== 'string' || !token.token) {
    return 'Expected idToken.token to be a non-empty string';
  }
  const dest = token.claims?.dest;
  if (typeof dest !== 'string' || !dest) {
    return 'Expected idToken.claims.dest to be a non-empty string';
  }
  if (
    dest.trim() !== dest ||
    !/^(?:https:\/\/)?[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/.test(dest)
  ) {
    return "Expected idToken.claims.dest to be a valid shop URL (e.g., 'https://shop.myshopify.com' or 'shop.myshopify.com')";
  }
  if (config.expiring !== undefined && typeof config.expiring !== 'boolean') {
    return 'Expected expiring to be a boolean';
  }
  if (config.accessMode === 'online' && config.expiring === false) {
    return 'The expiring parameter is only applicable to offline access tokens. Online tokens always expire.';
  }
}

function expiresIn(seconds: unknown): string | null {
  if (seconds === undefined || seconds === null) return null;
  if (typeof seconds !== 'number' || !Number.isFinite(seconds) || seconds < 0) {
    throw new Error('Invalid token expiry');
  }
  return new Date(Date.now() + seconds * 1000).toISOString();
}

function accessToken(
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
  ) {
    throw new Error('Invalid token response');
  }
  const user = body.associated_user;
  return {
    shop,
    accessMode,
    token: body.access_token,
    scope: body.scope,
    expires: expiresIn(body.expires_in),
    refreshToken: (body.refresh_token as string | undefined) ?? null,
    refreshTokenExpires: expiresIn(body.refresh_token_expires_in),
    user:
      accessMode === 'online' && isRecord(user)
        ? {
            id: Number(user.id),
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

export function shopifyApp(
  clientId: string,
  clientSecret: string,
  _oldClientSecret?: string,
) {
  return {
    async exchangeUsingTokenExchange(
      config: TokenExchangeConfig,
    ): Promise<TokenExchangeResult> {
      const httpLogs: HttpLog[] = [];
      let shop: string | null = null;
      const finish = (
        log: Log,
        res = response(500),
        token: TokenExchangeAccessToken | null = null,
      ): TokenExchangeResult => ({
        ok: token !== null,
        shop,
        accessToken: token,
        log,
        response: res,
        httpLogs,
      });
      const validationError = validate(config);
      if (validationError) {
        return finish({code: 'configuration_error', detail: validationError});
      }
      const shopDomain = String(config.idToken.claims.dest).replace(
        /^https:\/\//,
        '',
      );
      shop = shopDomain.replace(/\.myshopify\.com$/, '');

      for (let attempt = 0; ; attempt++) {
        const exchange = await executeTokenExchange(
          {
            clientId,
            clientSecret,
            shopDomain,
            idToken: config.idToken.token,
            requestedTokenType: `urn:shopify:params:oauth:token-type:${config.accessMode}-access-token`,
            expiring: config.expiring === false ? 0 : 1,
            headers: {
              'User-Agent':
                'shopify-app-native-spike v0.0.0 | JavaScript 2022.0',
            },
            redirect: 'manual',
          },
          globalThis.fetch.bind(globalThis),
        );
        const req = {
          ...exchange.request,
          body: JSON.stringify({
            ...JSON.parse(exchange.request.body),
            client_secret: '[REDACTED]',
            subject_token: '[REDACTED]',
          }),
        };
        let res = response(0);
        const record = (log: Log) => {
          httpLogs.push({...log, req, res});
          return log;
        };
        if (!exchange.ok) {
          return finish(
            record({code: 'network_error', detail: details.network_error}),
          );
        }
        const received = exchange.response;
        try {
          res = {
            status: received.status,
            body: await received.text(),
            headers: Object.fromEntries(
              Array.from(received.headers, ([name, value]) => [
                name.replace(/(^|-)\w/g, (part) => part.toUpperCase()),
                value,
              ]),
            ),
          };
        } catch {
          return finish(
            record({code: 'network_error', detail: details.network_error}),
          );
        }

        if (received.status === 429) {
          if (attempt === 2) {
            return finish(
              record({
                code: 'rate_limit_exceeded',
                detail: details.rate_limit_exceeded,
              }),
              {
                status: 429,
                body: '{"error":"Too many requests"}',
                headers: {'Content-Type': 'application/json'},
              },
            );
          }
          const header = received.headers.get('Retry-After');
          const parsed = header === null ? 1 : Number(header);
          const seconds = Number.isFinite(parsed) && parsed >= 0 ? parsed : 1;
          record({
            code: 'rate_limited_retry',
            detail: `Retrying after ${seconds} seconds.`,
          });
          await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
          continue;
        }

        let body: unknown;
        try {
          body = JSON.parse(res.body);
          if (received.status === 200) {
            const token = accessToken(body, shop, config.accessMode);
            return finish(
              record({code: 'success', detail: details.success}),
              response(200),
              token,
            );
          }
        } catch {
          return finish(
            record({
              code: 'exchange_error',
              detail:
                'Token exchange returned an invalid response. Respond 500 Internal Server Error using the provided response.',
            }),
          );
        }
        const error = isRecord(body) ? body.error : undefined;
        if (error === 'invalid_subject_token') {
          return finish(
            record({code: error, detail: details.invalid_subject_token}),
            config.invalidTokenResponse ?? response(401),
          );
        }
        if (error === 'invalid_client') {
          return finish(record({code: error, detail: details.invalid_client}));
        }
        return finish(
          record({
            code: 'exchange_error',
            detail: `Token exchange failed with error: ${String(error ?? 'unknown_error')}. Respond 500 Internal Server Error using the provided response.`,
          }),
        );
      }
    },
  };
}
