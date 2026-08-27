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
    if (response.status === StatusCode.Unauthorized) {
      await readJsonBody(response);
      accessToken = (await refreshGlobalApiToken(config, accessToken))
        .accessToken;
      response = (await postAppEvent(config, url, payload, accessToken))
        .response;
    }

    const body = await readJsonBody(response);
    if (!response.ok) {
      if (response.status === StatusCode.Unauthorized) {
        clearGlobalApiTokenIfMatches(config, accessToken);
      }
      throwFailedRequest(body, false, response);
    }

    return {
      replayed:
        response.headers.get('Idempotent-Replayed') !== null ||
        response.headers.get('Idempotent-Replay') !== null,
    };
  };
}
