import {CLIENT, RETRIABLE_STATUS_CODES, RETRY_WAIT_TIME} from './constants';
import {CustomFetchApi, GraphQLClient, Logger} from './types';
import {formatErrorMessage, getErrorMessage} from './utilities';

const MAX_TIMER_DELAY_MS = 2_147_483_647;

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
    let response: Response | undefined;

    try {
      response = await customFetchApi(...requestParams);

      clientLogger({
        type: 'HTTP-Response',
        content: {
          requestParams,
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
            requestParams,
            deprecationNotice,
          },
        });
      }

      return response;
    } catch (error) {
      if (nextCount <= maxTries) {
        const retryAfter = response?.headers.get('Retry-After');
        await sleep(parseRetryAfter(retryAfter, defaultRetryWaitTime));

        clientLogger({
          type: 'HTTP-Retry',
          content: {
            requestParams,
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

function parseRetryAfter(
  retryAfter: string | null | undefined,
  defaultRetryWaitTime: number,
): number {
  const value = retryAfter?.trim();
  if (!value) {
    return defaultRetryWaitTime;
  }

  // RFC Retry-After delay-seconds are integers, but Shopify APIs can return
  // fractional seconds, so accept them for compatibility.
  if (/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(value)) {
    const delay = Math.ceil(Number(value) * 1_000);
    return Math.min(delay, MAX_TIMER_DELAY_MS);
  }

  if (!Number.isNaN(Number(value))) {
    return defaultRetryWaitTime;
  }

  if (!/[a-z]/i.test(value)) {
    return defaultRetryWaitTime;
  }

  const date = Date.parse(value);
  if (Number.isNaN(date)) {
    return defaultRetryWaitTime;
  }

  return Math.min(Math.max(date - Date.now(), 0), MAX_TIMER_DELAY_MS);
}

async function sleep(waitTime: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, waitTime));
}
