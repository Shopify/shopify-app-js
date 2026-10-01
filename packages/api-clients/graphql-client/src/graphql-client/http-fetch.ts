import {CLIENT, RETRIABLE_STATUS_CODES, RETRY_WAIT_TIME} from './constants';
import {CustomFetchApi, GraphQLClient, Logger} from './types';
import {formatErrorMessage, getErrorMessage} from './utilities';

const REDACTED_HEADER_VALUE = '****';

// These headers carry reusable credentials and must not reach the logger.
const SENSITIVE_HEADERS = new Set([
  'authorization',
  'cookie',
  'set-cookie',
  'shopify-storefront-private-token',
  'x-shopify-access-token',
  'x-shopify-storefront-access-token',
]);

interface GenerateHttpFetchOptions {
  clientLogger: Logger;
  customFetchApi?: CustomFetchApi;
  client?: string;
  defaultRetryWaitTime?: number;
  retriableCodes?: number[];
}

export function generateHttpFetch({
  clientLogger,
  customFetchApi = fetch,
  client = CLIENT,
  defaultRetryWaitTime = RETRY_WAIT_TIME,
  retriableCodes = RETRIABLE_STATUS_CODES,
}: GenerateHttpFetchOptions) {
  const httpFetch = async (
    requestParams: Parameters<CustomFetchApi>,
    count: number,
    maxRetries: number,
  ): ReturnType<GraphQLClient['fetch']> => {
    const nextCount = count + 1;
    const maxTries = maxRetries + 1;
    const loggedRequestParams = redactRequestParams(requestParams);
    let response: Response | undefined;

    try {
      response = await customFetchApi(...requestParams);

      clientLogger({
        type: 'HTTP-Response',
        content: {
          requestParams: loggedRequestParams,
          response,
        },
      });

      if (
        !response.ok &&
        retriableCodes.includes(response.status) &&
        nextCount <= maxTries
      ) {
        throw new Error();
      }

      const deprecationNotice =
        response?.headers.get('X-Shopify-API-Deprecated-Reason') || '';
      if (deprecationNotice) {
        clientLogger({
          type: 'HTTP-Response-GraphQL-Deprecation-Notice',
          content: {
            requestParams: loggedRequestParams,
            deprecationNotice,
          },
        });
      }

      return response;
    } catch (error) {
      if (nextCount <= maxTries) {
        const retryAfter = response?.headers.get('Retry-After');
        await sleep(
          retryAfter ? parseInt(retryAfter, 10) : defaultRetryWaitTime,
        );

        clientLogger({
          type: 'HTTP-Retry',
          content: {
            requestParams: loggedRequestParams,
            lastResponse: response,
            retryAttempt: count,
            maxRetries,
          },
        });

        return httpFetch(requestParams, nextCount, maxRetries);
      }

      throw new Error(
        formatErrorMessage(
          `${
            maxRetries > 0
              ? `Attempted maximum number of ${maxRetries} network retries. Last message - `
              : ''
          }${getErrorMessage(error)}`,
          client,
        ),
      );
    }
  };

  return httpFetch;
}

function redactRequestParams(
  requestParams: Parameters<CustomFetchApi>,
): Parameters<CustomFetchApi> {
  const [url, init] = requestParams;
  if (!init?.headers) {
    return requestParams;
  }

  return [url, {...init, headers: redactHeaders(init.headers)}];
}

function redactHeaders(headers: HeadersInit): HeadersInit {
  const redactValue = (name: string, value: string) =>
    SENSITIVE_HEADERS.has(name.toLowerCase()) ? REDACTED_HEADER_VALUE : value;

  if (Array.isArray(headers)) {
    return headers.map(([name, value]) => [name, redactValue(name, value)]);
  }

  if (typeof Headers !== 'undefined' && headers instanceof Headers) {
    const redacted = new Headers();
    headers.forEach((value, name) => {
      redacted.set(name, redactValue(name, value));
    });
    return redacted;
  }

  return Object.fromEntries(
    Object.entries(headers).map(([name, value]) => [
      name,
      redactValue(name, value),
    ]),
  );
}

async function sleep(waitTime: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, waitTime));
}
