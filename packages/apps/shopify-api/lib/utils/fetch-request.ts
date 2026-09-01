import {logger} from '../logger';
import {LogSeverity} from '../types';
import {abstractFetch} from '../../runtime';
import {ConfigInterface} from '../base-types';
const SENSITIVE_REQUEST_BODY_PATHS: Record<string, true> = {
  '/admin/oauth/access_token': true,
  '/auth/access_token': true,
};

// Token endpoint bodies carry OAuth secrets, so they must not reach the logs.
// When the URL does not parse, fail closed and keep the body out of the logs.
function canLogRequestBody(url: string): boolean {
  try {
    return SENSITIVE_REQUEST_BODY_PATHS[new URL(url).pathname] !== true;
  } catch {
    return false;
  }
}

export type FetchRequestOptions = RequestInit & {
  logBody?: boolean;
};

export function fetchRequestFactory(config: ConfigInterface) {
  return async function fetchRequest(
    url: string,
    options?: FetchRequestOptions,
  ): Promise<Response> {
    const log = logger(config);
    const doLog =
      config.logger.httpRequests && config.logger.level === LogSeverity.Debug;
    const logBody = options?.logBody ?? true;
    let requestOptions: RequestInit | undefined;
    if (options) {
      const {logBody: _ignored, ...rest} = options;
      requestOptions = rest;
    }
    if (doLog) {
      log.debug('Making HTTP request', {
        method: options?.method || 'GET',
        url,
        ...(options?.body &&
          canLogRequestBody(url) && {
            body: logBody ? options.body : '[REDACTED]',
          }),
      });
    }

    const response = await abstractFetch(url, requestOptions);

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
