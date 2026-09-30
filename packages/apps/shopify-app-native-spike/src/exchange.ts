import type {HttpLog, Log, ResponseDetails, SendRequest} from './types';

export interface ExchangeOperation {
  clientId: string;
  clientSecret: string;
  shop: string;
  token: string;
  requestedTokenType: string;
  expiring: '0' | '1' | 0 | 1;
  headers?: Record<string, string>;
}

export interface ExchangePolicy {
  maxRetries: 0 | 2;
  redirect?: 'manual';
}

export type ExchangeOutcome = {httpLogs: HttpLog[]; log: Log} & (
  | {kind: 'response'; response: Response; body: unknown}
  | {kind: 'error'; error: unknown}
);

const details = {
  success:
    'Token exchange successful. Store the access token and proceed with business logic.',
  invalid_subject_token:
    'The ID token is invalid. Respond 401 Unauthorized using the provided response.',
  invalid_client:
    'Client credentials are invalid or the app has been uninstalled. Respond 500 Internal Server Error using the provided response.',
  network_error:
    'Network error occurred during token exchange. Respond 500 Internal Server Error using the provided response.',
  invalid_response:
    'Token exchange returned an invalid response. Respond 500 Internal Server Error using the provided response.',
  rate_limit_exceeded:
    'Max retries reached after rate limiting. Respond 429 Too Many Requests using the provided response.',
};

function classify(response: Response, body: unknown): Log {
  if (response.status === 429)
    return {code: 'rate_limit_exceeded', detail: details.rate_limit_exceeded};
  if (response.ok) return {code: 'success', detail: details.success};
  const error =
    body !== null && typeof body === 'object' && 'error' in body
      ? body.error
      : 'unknown_error';
  if (error === 'invalid_subject_token' || error === 'invalid_client')
    return {code: error, detail: details[error]};
  return {
    code: 'exchange_error',
    detail: `Token exchange failed with error: ${String(error)}. Respond 500 Internal Server Error using the provided response.`,
  };
}

export async function runTokenExchange(
  input: ExchangeOperation,
  fetch: SendRequest,
  policy: ExchangePolicy,
): Promise<ExchangeOutcome> {
  const body = {
    client_id: input.clientId,
    client_secret: input.clientSecret,
    grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
    subject_token: input.token,
    subject_token_type: 'urn:ietf:params:oauth:token-type:id_token',
    requested_token_type: input.requestedTokenType,
    expiring: input.expiring,
  };
  const request = {
    url: `https://${input.shop}/admin/oauth/access_token`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...input.headers,
    },
    body: JSON.stringify({
      ...body,
      client_secret: '[REDACTED]',
      subject_token: '[REDACTED]',
    }),
  };
  const httpLogs: HttpLog[] = [];
  for (let attempt = 0; ; attempt++) {
    let response: Response;
    let res: ResponseDetails = {status: 0, body: '', headers: {}};
    const record = (log: Log) => {
      httpLogs.push({...log, req: request, res});
      return log;
    };
    try {
      response = await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: JSON.stringify(body),
        ...(policy.redirect && {redirect: policy.redirect}),
      });
      res = {
        status: response.status,
        body: await response.text(),
        headers: Object.fromEntries(
          Array.from(response.headers, ([name, value]) => [
            name.replace(/(^|-)\w/g, (part) => part.toUpperCase()),
            value,
          ]),
        ),
      };
    } catch (error) {
      return {
        kind: 'error',
        error,
        httpLogs,
        log: record({code: 'network_error', detail: details.network_error}),
      };
    }
    if (response.status === 429 && attempt < policy.maxRetries) {
      const raw = response.headers.get('Retry-After');
      const parsed = raw === null ? 1 : Number(raw);
      const seconds = Number.isFinite(parsed) && parsed >= 0 ? parsed : 1;
      record({
        code: 'rate_limited_retry',
        detail: `Retrying after ${seconds} seconds.`,
      });
      await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
      continue;
    }
    let parsed: unknown;
    try {
      // The shared contract handles empty 429 bodies; the SDK keeps its JSON error.
      parsed =
        response.status === 429 && policy.maxRetries > 0
          ? null
          : JSON.parse(res.body);
    } catch (error) {
      return {
        kind: 'error',
        error,
        httpLogs,
        log: record({
          code: 'invalid_response',
          detail: details.invalid_response,
        }),
      };
    }
    return {
      kind: 'response',
      response,
      body: parsed,
      httpLogs,
      log: record(classify(response, parsed)),
    };
  }
}
