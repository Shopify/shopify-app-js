import {BasicParams} from '../../types';
import {REAUTH_URL_HEADER} from '../const';

export interface EnsureCORSFunction {
  (response: Response): Response;
}

export function ensureCORSHeadersFactory(
  params: BasicParams,
  request: Request,
  corsHeaders: string[] = [],
): EnsureCORSFunction {
  const {logger, config} = params;

  return function ensureCORSHeaders(response) {
    const origin = request.headers.get('Origin');
    if (origin && origin !== config.appUrl) {
      logger.debug(
        'Request comes from a different origin, adding CORS headers',
      );

      const corsHeadersSet = new Set([
        'Authorization',
        'Content-Type',
        ...corsHeaders,
      ]);

      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set(
        'Access-Control-Allow-Headers',
        [...corsHeadersSet].join(', '),
      );
      response.headers.set('Access-Control-Expose-Headers', REAUTH_URL_HEADER);
    }

    return response;
  };
}
