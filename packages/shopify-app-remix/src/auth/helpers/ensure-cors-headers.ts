import {BasicParams} from '../../types';
import {REAUTH_URL_HEADER} from '../const';

export function ensureCORSHeaders(
  params: BasicParams,
  request: Request,
  response: Response,
): void {
  const {logger, config} = params;

  if (request.headers.get('Origin') !== config.appUrl) {
    logger.debug('Request comes from a different origin, adding CORS headers');

    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Headers', 'Authorization');
    response.headers.set('Access-Control-Expose-Headers', REAUTH_URL_HEADER);
  }
}
