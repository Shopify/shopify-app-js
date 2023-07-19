import {BasicParams} from '../../types';

import {ensureCORSHeadersFactory} from './ensure-cors-headers';

export function respondToOptionsRequest(params: BasicParams, request: Request) {
  if (request.method === 'OPTIONS') {
    const response = new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Max-Age': '7200',
      },
    });

    throw ensureCORSHeadersFactory(params, request)(response);
  }
}
