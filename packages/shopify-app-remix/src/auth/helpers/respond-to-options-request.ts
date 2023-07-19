import {BasicParams} from '../../types';

import {ensureCORSHeaders} from './ensure-cors-headers';

export function respondToOptionsRequest(params: BasicParams, request: Request) {
  if (request.method === 'OPTIONS') {
    const response = new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Max-Age': '7200',
      },
    });

    throw ensureCORSHeaders(params, request, response);
  }
}
