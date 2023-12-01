import {BasicParams} from 'src/server/types';

import {redirectToBouncePage} from '../admin/helpers/redirect-to-bounce-page';

export function respondToInvalidSessionToken(
  params: BasicParams,
  request: Request,
) {
  const {api, logger, config} = params;

  const isDocumentRequest = !request.headers.get('authorization');
  if (isDocumentRequest) {
    return redirectToBouncePage({api, logger, config}, new URL(request.url));
  }

  // eslint-disable-next-line no-warning-comments
  // TODO add header so app bridge retries with new session token
  throw new Response(undefined, {
    status: 401,
    statusText: 'Unauthorized',
  });
}
