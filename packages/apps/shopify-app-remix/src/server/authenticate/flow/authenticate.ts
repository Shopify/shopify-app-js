import {ShopifyRestResources} from '@shopify/shopify-api';
import {authWebhook as authenticateFlow} from '@shopify/shopify-app-js';

import {toReq} from '../helpers/to-req';
import {AppConfigArg} from '../../config-types';
import {adminClientFactory} from '../../clients/admin';
import {BasicParams} from '../../types';

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

    const result = await authenticateFlow(toReq(request), {
      clientId: config.apiKey,
      clientSecret: config.apiSecretKey,
    });

    if (!result.ok) {
      logger.error(result.action as string, {reason: result.action});

      throw new Response(result.action as string, {
        status: result.response.status,
      });
    }

    const rawBody = await request.text();
    const payload = JSON.parse(rawBody);

    logger.debug('Flow request is valid, looking for an offline session', {
      shop: payload.shopify_domain,
    });

    const sessionId = api.session.getOfflineId(payload.shopify_domain);
    const session = await config.sessionStorage!.loadSession(sessionId);

    if (!session) {
      logger.info('Flow request could not find session', {
        shop: payload.shopify_domain,
      });
      throw new Response(undefined, {
        status: 400,
        statusText: 'Bad Request',
      });
    }

    logger.debug('Found a session for the flow request', {shop: session.shop});

    return {
      session,
      payload,
      admin: adminClientFactory<ConfigArg, Resources>({params, session}),
    };
  };
}
