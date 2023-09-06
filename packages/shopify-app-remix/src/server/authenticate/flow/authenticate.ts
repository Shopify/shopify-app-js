import {adminClientFactory} from 'src/server/clients/admin';
import {BasicParams} from 'src/server/types';

export function authenticateFlowFactory(params: BasicParams) {
  const {api, config, logger} = params;

  return async function authenticate(request: Request) {
    logger.info('Authenticating flow request');

    if (request.method !== 'POST') {
      logger.debug(
        'Received a non-POST request for flow. Only POST requests are allowed.',
        {url: request.url, method: request.method},
      );
      throw new Response(undefined, {
        status: 405,
        statusText: 'Method not allowed',
      });
    }

    const rawBody = await request.text();
    const {valid} = await api.flow.validate({
      rawBody,
      rawRequest: request,
    });

    if (!valid) {
      throw new Response(undefined, {
        status: 400,
        statusText: 'Bad Request',
      });
    }

    const payload = JSON.parse(rawBody);
    const sessionId = api.session.getOfflineId(payload.shopify_domain);
    const session = await config.sessionStorage.loadSession(sessionId);

    if (!session) {
      logger.info('Flow request could not find session', {
        shop: payload.shopify_domain,
      });
      throw new Response(undefined, {
        status: 400,
        statusText: 'Bad Request',
      });
    }

    return {
      session,
      payload,
      admin: adminClientFactory({params, session}),
    };
  };
}
