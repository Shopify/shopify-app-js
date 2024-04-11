import {
  ApiVersion,
  ShopifyRestResources,
  WebhookValidationErrorReason,
} from '@shopify/shopify-api';

import type {BasicParams, MandatoryTopics} from '../../types';
import {AdminApiContext, adminClientFactory} from '../../clients';
import {handleClientErrorFactory} from '../admin/helpers';
import {FutureFlagOptions} from '../../future/flags';

import type {
  AuthenticateWebhook,
  LegacyWebhookAdminApiContext,
  WebhookAdminContext,
  WebhookContext,
  WebhookContextWithoutSession,
} from './types';

export function authenticateWebhookFactory<
  Future extends FutureFlagOptions,
  Resources extends ShopifyRestResources,
  Topics extends string | number | symbol | MandatoryTopics,
>(params: BasicParams): AuthenticateWebhook<Future, Resources, Topics> {
  const {api, config, logger} = params;

  return async function authenticate(
    request: Request,
  ): Promise<WebhookContext<Future, Resources, Topics>> {
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

    const sessionId = api.session.getOfflineId(check.domain);
    const session = await config.sessionStorage.loadSession(sessionId);
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

    let admin:
      | AdminApiContext<Resources>
      | LegacyWebhookAdminApiContext<Resources>;
    if (config.future.v3_webhookAdminContext) {
      admin = adminClientFactory<Resources>({
        params,
        session,
        handleClientError: handleClientErrorFactory({request}),
      });
    } else {
      const restClient = new api.clients.Rest({
        session,
        apiVersion: check.apiVersion as ApiVersion,
      });
      const graphqlClient = new api.clients.Graphql({
        session,
        apiVersion: check.apiVersion as ApiVersion,
      });

      Object.entries(api.rest).forEach(([name, resource]) => {
        Reflect.set(restClient, name, resource);
      });

      admin = {
        rest: restClient as typeof restClient & Resources,
        graphql: graphqlClient,
      };
    }

    return {
      ...webhookContext,
      session,
      admin: admin as WebhookAdminContext<Future, Resources>,
    };
  };
}
