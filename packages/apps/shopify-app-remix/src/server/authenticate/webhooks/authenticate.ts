import {
  ShopifyRestResources,
  WebhookValidationErrorReason,
} from '@shopify/shopify-api';

import {AppConfigArg} from '../../config-types';
import type {BasicParams} from '../../types';
import {adminClientFactory} from '../../clients';
import {
  createOrLoadOfflineSession,
  getMemoizedSessionForHeadlessRequest,
  getSessionTokenHeader,
} from '../helpers';
import {lazyAdminClientFactory} from '../../clients/admin';

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
  const {api, logger, config} = params;

  return async function authenticate(
    request: Request,
  ): Promise<WebhookContext<ConfigArg, Resources, Topics>> {
    if (request.method !== 'POST') {
      logger.debug(
        'Received a non-POST request for a webhook. Only POST requests are allowed.',
        {url: request.url, method: request.method},
      );
      throw new Response(undefined, {
        status: 405,
        statusText: 'Method not allowed',
      });
    }

    const rawBody = await request.text();

    const check = await api.webhooks.validate({
      rawBody,
      rawRequest: request,
    });

    if (!check.valid) {
      if (check.reason === WebhookValidationErrorReason.InvalidHmac) {
        logger.debug('Webhook HMAC validation failed', check);
        throw new Response(undefined, {
          status: 401,
          statusText: 'Unauthorized',
        });
      } else {
        logger.debug('Webhook validation failed', check);
        throw new Response(undefined, {status: 400, statusText: 'Bad Request'});
      }
    }

    const webhookContext = {
      apiVersion: check.apiVersion,
      shop: check.domain,
      topic: check.topic as Topics,
      webhookId: check.webhookId,
      payload: JSON.parse(rawBody),
      subTopic: check.subTopic || undefined,
      session: undefined,
      admin: undefined,
    };

    if (config.future?.lazy_session_creation !== true) {
      const session = await createOrLoadOfflineSession(check.domain, params);

      if (!session) {
        // PENDING: Probably not type safe
        return webhookContext as WebhookContext<ConfigArg, Resources, Topics>;
      }

      // PENDING: Probably not type safe
      return {
        ...webhookContext,
        session,
        admin: adminClientFactory<ConfigArg, Resources>({
          params,
          session,
        }),
      } as WebhookContext<ConfigArg, Resources, Topics>;
    }

    // PENDING: Probably not type safe
    return {
      ...webhookContext,
      admin: lazyAdminClientFactory({
        params,
        getSession: getMemoizedSessionForHeadlessRequest(params, request),
      }),
    } as WebhookContext<ConfigArg, Resources, Topics>;
  };
}
