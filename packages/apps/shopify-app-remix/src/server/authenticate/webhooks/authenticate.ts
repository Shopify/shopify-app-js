import {
  Session,
  WebhookValidationErrorReason,
  WebhookType,
} from '@shopify/shopify-api';

import type {BasicParams} from '../../types';
import {adminClientFactory} from '../../clients';
import {handleClientErrorFactory} from '../admin/helpers';
import {ensureValidOfflineSession} from '../../helpers';

import type {
  AuthenticateWebhook,
  WebhookContext,
  WebhookContextWithoutSession,
} from './types';

export function authenticateWebhookFactory<Topics extends string>(
  params: BasicParams,
): AuthenticateWebhook<Topics> {
  const {api, logger} = params;

  return async function authenticate(
    request: Request,
  ): Promise<WebhookContext<Topics>> {
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
    let session: Session | undefined;
    try {
      session = await ensureValidOfflineSession(params, check.domain);
    } catch (error) {
      // Refreshing an expired offline token can fail after the merchant
      // uninstalls the app, since Shopify rejects the refresh request. The
      // HMAC has already been validated at this point and webhook contexts
      // support a missing session, so deliver the webhook without one rather
      // than responding with a 500 — that would make Shopify retry mandatory
      // webhooks (e.g. APP_UNINSTALLED, GDPR topics) indefinitely.
      if (error instanceof Response) {
        logger.debug(
          'Failed to load a valid offline session for webhook request, continuing without a session',
          {shop: check.domain, topic: check.topic},
        );
        session = undefined;
      } else {
        throw error;
      }
    }

    let webhookContext: WebhookContextWithoutSession<Topics>;

    if (check.webhookType === WebhookType.Webhooks) {
      webhookContext = {
        apiVersion: check.apiVersion,
        shop: check.domain,
        topic: check.topic as Topics,
        webhookId: check.webhookId,
        payload: JSON.parse(rawBody),
        session: undefined,
        admin: undefined,
        webhookType: check.webhookType,
        name: check.name,
        triggeredAt: check.triggeredAt,
        eventId: check.eventId,
      };
    } else {
      webhookContext = {
        apiVersion: check.apiVersion,
        shop: check.domain,
        topic: check.topic as Topics,
        webhookId: check.webhookId,
        payload: JSON.parse(rawBody),
        session: undefined,
        admin: undefined,
        webhookType: check.webhookType,
        handle: check.handle,
        action: check.action,
        resourceId: check.resourceId,
        triggeredAt: check.triggeredAt,
        eventId: check.eventId,
      };
    }

    if (!session) {
      return webhookContext;
    }

    const admin = adminClientFactory({
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
