import {ShopifyRestResources} from '@shopify/shopify-api';

import {AppConfigArg} from '../../config-types';
import {adminClientFactory} from '../../clients/admin';
import type {BasicParams} from '../../types';
import {getSessionTokenHeader, tokenExchangeHeadlessRequest} from '../helpers';

import type {AuthenticateFlow, FlowContext} from './types';

export function authenticateFlowFactory<
  ConfigArg extends AppConfigArg,
  Resources extends ShopifyRestResources = ShopifyRestResources,
>(params: BasicParams): AuthenticateFlow<ConfigArg, Resources> {
  const {api, config, logger} = params;

  return async function authenticate(
    request: Request,
  ): Promise<FlowContext<ConfigArg, Resources>> {
    logger.info('Authenticating flow request');

    if (request.method !== 'POST') {
      logger.debug(
        `Received a ${request.method} request for flow. Only POST requests are allowed.`,
        {url: request.url, method: request.method},
      );
      throw new Response(undefined, {
        status: 405,
        statusText: 'Method not allowed',
      });
    }

    const rawBody = await request.text();
    const result = await api.flow.validate({
      rawBody,
      rawRequest: request,
    });

    if (!result.valid) {
      logger.error('Received an invalid flow request', {reason: result.reason});

      throw new Response(undefined, {
        status: 400,
        statusText: 'Bad Request',
      });
    }

    const payload = JSON.parse(rawBody);

    logger.debug('Flow request is valid, looking for an offline session', {
      shop: payload.shopify_domain,
    });

    const sessionId = api.session.getOfflineId(payload.shopify_domain);
    let session = await config.sessionStorage!.loadSession(sessionId);

    if (session) {
      logger.debug('Found a session for the flow request', {
        shop: session.shop,
      });
    } else {
      logger.debug('Could not find a session for the flow request');

      const idToken = getSessionTokenHeader(request);

      if (!idToken) {
        logger.debug('Could not find an idToken to perform Token Exchange');
        throw BadRequestError();
      }

      session = await tokenExchangeHeadlessRequest(
        params,
        idToken,
        payload.shopify_domain,
      );

      if (!session) {
        logger.debug('Token Exchange failed, cannot continue');
        throw BadRequestError();
      }
    }

    return {
      session,
      payload,
      admin: adminClientFactory<ConfigArg, Resources>({params, session}),
    };
  };
}

function BadRequestError() {
  return new Response(undefined, {
    status: 400,
    statusText: 'Bad Request',
  });
}
