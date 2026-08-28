import {ConfigInterface} from '../base-types';
import {
  clearGlobalApiTokenIfMatches,
  getGlobalApiToken,
  refreshGlobalApiToken,
} from '../auth/oauth/global-api-client-credentials';
import {getUserAgent, throwFailedRequest} from '../clients/common';
import {DataType} from '../clients/types';
import {Method, StatusCode} from '../types';
import {fetchRequestFactory} from '../utils/fetch-request';
import {readJsonBody} from '../utils/read-json-body';

import {AppEventLog, AppEventPayload} from './types';
import {validateAppEvent} from './validate';

interface PostAppEventResult {
  response: Response;
  accessToken: string;
}
const MAX_IDEMPOTENCY_RETRIES = 2;
const DEFAULT_IDEMPOTENCY_RETRY_DELAY_MS = 1000;

function getIdempotencyRetryDelayMs(response: Response): number {
  const retryAfter = response.headers.get('Retry-After');
  if (retryAfter === null) {
    return DEFAULT_IDEMPOTENCY_RETRY_DELAY_MS;
  }

  const seconds = Number(retryAfter);
  return Number.isFinite(seconds) && seconds >= 0
    ? seconds * 1000
    : DEFAULT_IDEMPOTENCY_RETRY_DELAY_MS;
}

async function postAppEvent(
  config: ConfigInterface,
  url: string,
  payload: AppEventPayload,
  accessToken?: string,
): Promise<PostAppEventResult> {
  const token = accessToken ?? (await getGlobalApiToken(config)).accessToken;

  const response = await fetchRequestFactory(config)(url, {
    method: Method.Post,
    headers: {
      'Content-Type': DataType.JSON,
      Accept: DataType.JSON,
      Authorization: `Bearer ${token}`,
      'User-Agent': getUserAgent(config),
    },
    body: JSON.stringify(payload),
  });

  return {response, accessToken: token};
}

export function appEventLog(config: ConfigInterface): AppEventLog {
  return async (event) => {
    const payload = validateAppEvent(event);
    const url = `${config.globalApiUrl}/app/${config.globalApiVersion}/events`;

    let {response, accessToken} = await postAppEvent(config, url, payload);
    let idempotencyRetries = 0;
    let tokenRefreshed = false;
    while (true) {
      if (response.status === StatusCode.Unauthorized) {
        if (tokenRefreshed) {
          break;
        }
        tokenRefreshed = true;
        await readJsonBody(response);
        accessToken = (await refreshGlobalApiToken(config, accessToken))
          .accessToken;
        response = (await postAppEvent(config, url, payload, accessToken))
          .response;
        continue;
      }

      if (
        response.status === 409 &&
        idempotencyRetries < MAX_IDEMPOTENCY_RETRIES
      ) {
        idempotencyRetries += 1;
        await new Promise<void>((resolve) =>
          setTimeout(resolve, getIdempotencyRetryDelayMs(response)),
        );
        response = (await postAppEvent(config, url, payload, accessToken))
          .response;
        continue;
      }

      break;
    }

    const body = await readJsonBody(response);
    if (!response.ok) {
      if (response.status === StatusCode.Unauthorized) {
        clearGlobalApiTokenIfMatches(config, accessToken);
      }
      throwFailedRequest(body, false, response);
    }

    return {
      replayed: ['Idempotent-Replayed', 'Idempotent-Replay'].some(
        (headerName) =>
          response.headers.get(headerName)?.trim().toLowerCase() === 'true',
      ),
    };
  };
}
