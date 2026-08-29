import {
  HTTPResponseLog,
  HTTPRetryLog,
  HTTPResponseGraphQLDeprecationNotice,
  LogContent,
} from '@shopify/admin-api-client';

import * as ShopifyErrors from '../error';
import {LIBRARY_NAME, StatusCode} from '../types';
import {ConfigInterface} from '../base-types';
import {SHOPIFY_API_LIBRARY_VERSION} from '../version';
import {
  getAbstractRuntimeString,
  canonicalizeHeaders,
  getHeader,
} from '../../runtime';
import {logger} from '../logger';

export function getUserAgent(config: ConfigInterface): string {
  let userAgentPrefix = `${LIBRARY_NAME} v${SHOPIFY_API_LIBRARY_VERSION} | ${getAbstractRuntimeString()}`;
  if (config.userAgentPrefix) {
    userAgentPrefix = `${config.userAgentPrefix} | ${userAgentPrefix}`;
  }

  return userAgentPrefix;
}

const REDACTED_LOG_VALUE = '****';

// These headers carry reusable credentials and must not reach the logs.
const SENSITIVE_LOG_HEADERS = new Set([
  'authorization',
  'cookie',
  'set-cookie',
  'shopify-storefront-private-token',
  'x-shopify-access-token',
  'x-shopify-storefront-access-token',
]);

function sanitizeHeaderValue(name: string, value: unknown): unknown {
  return SENSITIVE_LOG_HEADERS.has(name.toLowerCase())
    ? REDACTED_LOG_VALUE
    : value;
}

// Keep the original serialized shape of request headers. A Headers instance
// has no own enumerable properties, so it stays opaque here, the same as
// JSON.stringify shows it.
function sanitizeHeaders(headers: any): any {
  if (!headers || typeof headers !== 'object') {
    return headers;
  }

  if (Array.isArray(headers)) {
    return headers.map((header) =>
      Array.isArray(header)
        ? [header[0], sanitizeHeaderValue(header[0], header[1])]
        : header,
    );
  }

  return Object.fromEntries(
    Object.entries(headers).map(([name, value]) => [
      name,
      sanitizeHeaderValue(name, value),
    ]),
  );
}

// Response headers were always enumerated in the log, so keep that and
// redact the credential values.
function sanitizeEnumerableHeaders(headers: any): any {
  if (typeof headers?.entries === 'function' && !Array.isArray(headers)) {
    return Object.fromEntries(
      [...headers.entries()].map(([name, value]: [string, string]) => [
        name,
        sanitizeHeaderValue(name, value),
      ]),
    );
  }

  return sanitizeHeaders(headers);
}

function sanitizeRequestParams<T>(requestParams: T): T {
  if (Array.isArray(requestParams)) {
    return requestParams.map((param) =>
      param && typeof param === 'object' && 'headers' in param
        ? {...param, headers: sanitizeHeaders(param.headers)}
        : param,
    ) as T;
  }

  if (
    requestParams &&
    typeof requestParams === 'object' &&
    'headers' in requestParams
  ) {
    return {
      ...requestParams,
      headers: sanitizeHeaders((requestParams as {headers: any}).headers),
    };
  }

  return requestParams;
}

function serializeResponse(response: Response | any) {
  if (!response) {
    return {error: 'No response object provided'};
  }

  try {
    const {status, statusText, ok, redirected, type, url, headers} = response;

    const serialized: any = {
      status,
      statusText,
      ok,
      redirected,
      type,
      url,
    };

    if (headers) {
      serialized.headers = sanitizeEnumerableHeaders(headers);
    }

    return serialized;
  } catch {
    return response;
  }
}

export function clientLoggerFactory(config: ConfigInterface) {
  return (logContent: LogContent) => {
    if (config.logger.httpRequests) {
      switch (logContent.type) {
        case 'HTTP-Response': {
          const responseLog: HTTPResponseLog['content'] = logContent.content;
          logger(config).debug('Received response for HTTP request', {
            requestParams: JSON.stringify(
              sanitizeRequestParams(responseLog.requestParams),
            ),
            response: JSON.stringify(serializeResponse(responseLog.response)),
          });
          break;
        }
        case 'HTTP-Retry': {
          const responseLog: HTTPRetryLog['content'] = logContent.content;
          logger(config).debug('Retrying HTTP request', {
            requestParams: JSON.stringify(
              sanitizeRequestParams(responseLog.requestParams),
            ),
            retryAttempt: responseLog.retryAttempt,
            maxRetries: responseLog.maxRetries,
            response: responseLog.lastResponse
              ? JSON.stringify(serializeResponse(responseLog.lastResponse))
              : 'undefined',
          });
          break;
        }
        case 'HTTP-Response-GraphQL-Deprecation-Notice': {
          const responseLog: HTTPResponseGraphQLDeprecationNotice['content'] =
            logContent.content;
          logger(config).debug(
            'Received response containing Deprecated GraphQL Notice',
            {
              requestParams: JSON.stringify(
                sanitizeRequestParams(responseLog.requestParams),
              ),
              deprecationNotice: responseLog.deprecationNotice,
            },
          );
          break;
        }
        default: {
          logger(config).debug(`HTTP request event: ${logContent.content}`);
          break;
        }
      }
    }
  };
}

export function throwFailedRequest(
  body: any,
  atMaxRetries: boolean,
  response?: Response,
): never {
  if (typeof response === 'undefined') {
    const message = body?.errors?.message ?? '';
    throw new ShopifyErrors.HttpRequestError(
      `Http request error, no response available: ${message}`,
    );
  }

  const responseHeaders = canonicalizeHeaders(
    Object.fromEntries(response.headers.entries() ?? []),
  );

  if (response.status === StatusCode.Ok && body.errors.graphQLErrors) {
    throw new ShopifyErrors.GraphqlQueryError({
      message:
        body.errors.graphQLErrors?.[0].message ?? 'GraphQL operation failed',
      response: response as Record<string, any>,
      headers: responseHeaders,
      body: body as Record<string, any>,
    });
  }

  const errorMessages: string[] = [];
  if (body.errors) {
    errorMessages.push(JSON.stringify(body.errors, null, 2));
  }
  const xRequestId = getHeader(responseHeaders, 'x-request-id');
  if (xRequestId) {
    errorMessages.push(
      `If you report this error, please include this id: ${xRequestId}`,
    );
  }

  const errorMessage = errorMessages.length
    ? `:\n${errorMessages.join('\n')}`
    : '';
  const code = response.status;
  const statusText = response.statusText;

  switch (true) {
    case response.status === StatusCode.TooManyRequests: {
      if (atMaxRetries) {
        throw new ShopifyErrors.HttpMaxRetriesError(
          'Attempted the maximum number of retries for HTTP request.',
        );
      } else {
        const retryAfter = getHeader(responseHeaders, 'Retry-After');
        throw new ShopifyErrors.HttpThrottlingError({
          message: `Shopify is throttling requests ${errorMessage}`,
          code,
          statusText,
          body,
          headers: responseHeaders,
          retryAfter: retryAfter ? parseFloat(retryAfter) : undefined,
        });
      }
    }
    case response.status >= StatusCode.InternalServerError:
      if (atMaxRetries) {
        throw new ShopifyErrors.HttpMaxRetriesError(
          'Attempted the maximum number of retries for HTTP request.',
        );
      } else {
        throw new ShopifyErrors.HttpInternalError({
          message: `Shopify internal error${errorMessage}`,
          code,
          statusText,
          body,
          headers: responseHeaders,
        });
      }
    default:
      throw new ShopifyErrors.HttpResponseError({
        message: `Received an error response (${response.status} ${response.statusText}) from Shopify${errorMessage}`,
        code,
        statusText,
        body,
        headers: responseHeaders,
      });
  }
}
