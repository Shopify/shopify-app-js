import {WebhookValidationErrorReason} from '@shopify/shopify-api';
import type {MiddlewareFunction} from 'react-router';

import type {BasicParams} from '../types';
import {adminClientFactory} from '../clients';
import {handleClientErrorFactory} from '../authenticate/admin/helpers';
import {createOrLoadOfflineSession} from '../authenticate/helpers';
import type {AppConfigArg} from '../config-types';

import {webhookContext} from './contexts';
import type {WebhookContext} from './types';

/**
 * Creates webhook authentication middleware.
 *
 * This middleware validates Shopify webhook requests using HMAC signature verification,
 * loads the shop's session (if available), and provides webhook data through context.
 *
 * IMPORTANT: This middleware matches the behavior of authenticate.webhook()
 * - Validates HMAC signature
 * - Extracts webhook headers (topic, shop, webhookId, etc.)
 * - Loads offline session (undefined if app is uninstalled)
 * - Creates admin API client only when session exists
 *
 * @example
 * ```typescript
 * // app/routes/webhooks.$.tsx
 * export const middleware = [withWebhook()];
 *
 * export async function action({ context }) {
 *   const webhook = context.get(webhookContext);
 *
 *   if (!webhook.session) {
 *     return new Response(null, { status: 200 });
 *   }
 *
 *   // Route based on topic in your action code
 *   switch (webhook.topic) {
 *     case "products/create":
 *       await processProductCreation(webhook.payload, webhook.session);
 *       break;
 *     case "orders/paid":
 *       await processOrder(webhook.payload, webhook.session);
 *       break;
 *   }
 *
 *   return new Response(null, { status: 200 });
 * }
 * ```
 */
export function createWithWebhook<
  Config extends AppConfigArg,
  Topics extends string = string,
>(params: BasicParams<Config['future']>): MiddlewareFunction {
  const {api, logger} = params;

  return async ({context, request}, next) => {
    // Webhooks MUST be POST requests
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

    // Clone request before reading body to preserve original stream
    // This prevents "body disturbed or locked" errors
    const clonedRequest = request.clone();
    const rawBody = await clonedRequest.text();

    // Validate webhook using Shopify API's validation
    const check = await api.webhooks.validate({
      rawBody,
      rawRequest: clonedRequest,
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

    // Load or create offline session
    const session = await createOrLoadOfflineSession(check.domain, params);

    // Parse payload
    const payload = JSON.parse(rawBody);

    // Build webhook context (without session/admin initially)
    const webhookCtx: WebhookContext<Topics> = {
      apiVersion: check.apiVersion,
      shop: check.domain,
      topic: check.topic as Topics,
      webhookId: check.webhookId,
      payload,
      subTopic: check.subTopic || undefined,
      session: undefined,
      admin: undefined,
    };

    // If session exists, add it and create admin API
    if (session) {
      webhookCtx.session = session;
      webhookCtx.admin = adminClientFactory({
        params,
        session,
        handleClientError: handleClientErrorFactory({request}),
      });
    }

    // Set context for action to use
    context.set(webhookContext, webhookCtx);

    // Continue to action
    return next();
  };
}

/**
 * Wrapper function for easier usage with pre-configured params
 * This is what gets exposed through the shopify.middleware API
 */
export function withWebhookFactory<Config extends AppConfigArg>(
  params: BasicParams<Config['future']>,
) {
  return <Topics extends string = string>(): MiddlewareFunction => {
    return createWithWebhook<Config, Topics>(params);
  };
}
