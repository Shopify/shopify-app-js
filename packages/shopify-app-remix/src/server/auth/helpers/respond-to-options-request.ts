import {BasicParams} from '../../types';

import {ensureCORSHeadersFactory} from './ensure-cors-headers';

export function respondToOptionsRequest(params: BasicParams, request: Request) {
  if (request.method === 'OPTIONS') {
    const ensureCORSHeaders = ensureCORSHeadersFactory(params, request);

    throw ensureCORSHeaders(
      new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Max-Age': '7200',
        },
      }),
    );
  }
}
