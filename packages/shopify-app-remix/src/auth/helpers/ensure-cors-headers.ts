import {BasicParams} from '../../types';
import {REAUTH_URL_HEADER} from '../const';

export interface EnsureCORSFunction {
  (response: Response | Promise<Response>): Promise<void>;
}

export function ensureCORSHeadersFactory(
  params: BasicParams,
  request: Request,
): EnsureCORSFunction {
  const {logger, config} = params;

  return async function ensureCORSHeaders(
    response: Response | Promise<Response>,
  ): Promise<void> {
    const awaited = await response;

    if (request.headers.get('Origin') !== config.appUrl) {
      logger.debug(
        'Request comes from a different origin, adding CORS headers',
      );

      awaited.headers.set('Access-Control-Allow-Origin', '*');
      awaited.headers.set('Access-Control-Allow-Headers', 'Authorization');
      awaited.headers.set('Access-Control-Expose-Headers', REAUTH_URL_HEADER);
    }
  };
}
