import {ShopifyRestResources} from '@shopify/shopify-api';
import {authWebhook} from '@shopify/shopify-app-js';

import {AppConfigArg} from '../../config-types';
import type {BasicParams} from '../../types';
import {adminClientFactory} from '../../clients';
import {handleClientErrorFactory} from '../admin/helpers';
import {createOrLoadOfflineSession} from '../helpers';
import {toReq} from '../helpers/to-req';

import type {
  AuthenticateWebhook,
  WebhookContext,
  WebhookContextWithoutSession,
} from './types';

export function authenticateWebhookFactory<
  ConfigArg extends AppConfigArg,
  Resources extends ShopifyRestResources,
  Topics extends string,
>(params: BasicParams): AuthenticateWebhook<ConfigArg, Resources, Topics> {
  const {logger, config} = params;

  return async function authenticate(
    request: Request,
  ): Promise<WebhookContext<ConfigArg, Resources, Topics>> {
    const req = toReq(request);
    const result = await authWebhook(toReq(request), {
      clientId: config.apiKey,
      clientSecret: config.apiSecretKey,
    });

    if (!result.ok) {
      logger.error(result.action as string, {
        reason: result.action,
      });

      throw new Response(result.response.body, {
        status: result.response.status,
      });
    }

    const domain = req.headers.domain;
    const session = await createOrLoadOfflineSession(domain, params);
    const webhookContext: WebhookContextWithoutSession<Topics> = {
      shop: domain,
      apiVersion: req.headers.apiVersion,
      topic: req.headers.topic as Topics,
      webhookId: req.headers.webhookId,
      subTopic: req.headers.subTopic || undefined,
      payload: JSON.parse(req.body as string),
      session: undefined,
      admin: undefined,
    };

    if (!session) {
      return webhookContext;
    }

    const admin = adminClientFactory<ConfigArg, Resources>({
      params,
      session,
      handleClientError: handleClientErrorFactory({request}),
    });

    return {
      ...webhookContext,
      session,
      admin,
    };
  };
}
