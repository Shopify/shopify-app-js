import {ConfigInterface} from '../base-types';
import {getUserAgent, throwFailedRequest} from '../clients/common';
import {DataType} from '../clients/types';
import {InvalidAppEventError} from '../error';
import {Method} from '../types';
import {fetchRequestFactory} from '../utils/fetch-request';
import {readJsonBody} from '../utils/read-json-body';

import {AppEventLog} from './types';
import {validateAppEvent} from './validate';

export function appEventLog(config: ConfigInterface): AppEventLog {
  return async ({accessToken, ...event}) => {
    if (typeof accessToken !== 'string' || accessToken.length === 0) {
      throw new InvalidAppEventError(
        'accessToken must be a non-empty Global API access token',
      );
    }
    const payload = validateAppEvent(config, event);

    const response = await fetchRequestFactory(config)(
      `${config.globalApiUrl}/app/${config.globalApiVersion}/events`,
      {
        method: Method.Post,
        headers: {
          'Content-Type': DataType.JSON,
          Accept: DataType.JSON,
          Authorization: `Bearer ${accessToken}`,
          'User-Agent': getUserAgent(config),
        },
        body: JSON.stringify(payload),
      },
    );

    const body = await readJsonBody(response);
    if (!response.ok) {
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
