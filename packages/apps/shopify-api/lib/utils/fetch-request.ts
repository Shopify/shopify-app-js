import {logger} from '../logger';
import {LogSeverity} from '../types';
import {abstractFetch} from '../../runtime';
import {ConfigInterface} from '../base-types';

const OAUTH_TOKEN_ENDPOINT_PATH = '/admin/oauth/access_token';

// Token endpoint bodies carry OAuth secrets, so they must not reach the logs.
// When the URL does not parse, fail closed and keep the body out of the logs.
function canLogRequestBody(url: string): boolean {
  try {
    return new URL(url).pathname !== OAUTH_TOKEN_ENDPOINT_PATH;
  } catch {
    return false;
  }
}

export function fetchRequestFactory(config: ConfigInterface) {
  return async function fetchRequest(
    url: string,
    options?: RequestInit,
  ): Promise<Response> {
    const log = logger(config);
    const doLog =
      config.logger.httpRequests && config.logger.level === LogSeverity.Debug;

    if (doLog) {
      log.debug('Making HTTP request', {
        method: options?.method || 'GET',
        url,
        ...(options?.body && canLogRequestBody(url) && {body: options.body}),
      });
    }

    const response = await abstractFetch(url, options);

    if (doLog) {
      log.debug('HTTP request completed', {
        method: options?.method || 'GET',
        url,
        status: response.status,
      });
    }

    return response;
  };
}
