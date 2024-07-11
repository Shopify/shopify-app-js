import {
  ShopifyRestResources,
  WebhookValidationErrorReason,
} from '@shopify/shopify-api';

import type {BasicParams} from '../../types';
import {adminClientFactory} from '../../clients';
import {handleClientErrorFactory} from '../admin/helpers';
import {createOrLoadOfflineSession} from '../helpers';

import type {
  AuthenticateWebhook,
  WebhookContext,
  WebhookContextWithoutSession,
} from './types';

export function authenticateWebhookFactory<
  Resources extends ShopifyRestResources,
  Topics extends string,
>(params: BasicParams): AuthenticateWebhook<Resources, Topics> {
  const {api, logger} = params;

  return async function authenticate(
    request: Request,
  ): Promise<WebhookContext<Resources, Topics>> {
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
    const session = await createOrLoadOfflineSession(check.domain, params);
    const webhookContext: WebhookContextWithoutSession<Topics> = {
      apiVersion: check.apiVersion,
      shop: check.domain,
      topic: check.topic as Topics,
      webhookId: check.webhookId,
      payload: JSON.parse(rawBody),
      subTopic: check.subTopic || undefined,
      session: undefined,
      admin: undefined,
    };

    if (!session) {
      return webhookContext;
    }

    const admin = adminClientFactory<Resources>({
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
