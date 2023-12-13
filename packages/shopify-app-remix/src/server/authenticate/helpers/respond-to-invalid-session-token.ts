import {BasicParams} from 'src/server/types';

import {redirectToBouncePage} from '../admin/helpers/redirect-to-bounce-page';
import {RETRY_INVALID_SESSION_HEADER} from '../const';

interface RespondToInvalidSessionTokenParams {
  params: BasicParams;
  request: Request;
  retryRequest?: boolean;
}

export function respondToInvalidSessionToken({
  params,
  request,
  retryRequest = false,
}: RespondToInvalidSessionTokenParams) {
  const {api, logger, config} = params;

  const isDocumentRequest = !request.headers.get('authorization');
  if (isDocumentRequest) {
    return redirectToBouncePage({api, logger, config}, new URL(request.url));
  }

  throw new Response(undefined, {
    status: 401,
    statusText: 'Unauthorized',
    headers: retryRequest ? RETRY_INVALID_SESSION_HEADER : {},
  });
}
