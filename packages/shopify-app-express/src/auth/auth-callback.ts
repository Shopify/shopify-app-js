import {Request, Response} from 'express';
import {
  CookieNotFound,
  gdprTopics,
  InvalidOAuthError,
  Session,
  Shopify,
} from '@shopify/shopify-api';

import {AppConfigInterface} from '../config-types';
import {redirectToAuth} from '../redirect-to-auth';

import {AuthCallbackParams} from './types';

export async function authCallback({
  req,
  res,
  api,
  config,
}: AuthCallbackParams) {
  await config.logger.info('Initiating auth callback request');

  try {
    const callbackResponse = await api.auth.callback({
      isOnline: config.useOnlineTokens,
      rawRequest: req,
      rawResponse: res,
    });
    res.locals.shopify = {
      ...res.locals.shopify,
      session: callbackResponse.session,
    };

    await config.logger.debug('Callback is valid, storing session', {
      shop: callbackResponse.session.shop,
    });

    config.sessionStorage.storeSession(callbackResponse.session);

    await config.logger.debug('Completed OAuth callback', {
      shop: callbackResponse.session.shop,
    });

    await afterAuthActions(req, res, config, api, callbackResponse.session);
  } catch (error) {
    await config.logger.error(`Failed to complete OAuth with error: ${error}`);

    await handleCallbackError(req, res, api, config, error);
  }
}

async function afterAuthActions(
  _req: Request,
  _res: Response,
  config: AppConfigInterface,
  api: Shopify,
  session: Session,
) {
  await registerWebhooks(config, api, session);
}

async function registerWebhooks(
  config: AppConfigInterface,
  api: Shopify,
  session: Session,
) {
  await config.logger.debug('Registering webhooks', {shop: session.shop});

  const responsesByTopic = await api.webhooks.register({session});

  for (const topic in responsesByTopic) {
    if (!Object.prototype.hasOwnProperty.call(responsesByTopic, topic)) {
      continue;
    }

    for (const response of responsesByTopic[topic]) {
      if (!response.success && !gdprTopics.includes(topic)) {
        const result: any = response.result;

        if (result.errors) {
          await config.logger.error(
            `Failed to register ${topic} webhook: ${result.errors[0].message}`,
            {shop: session.shop},
          );
        } else {
          await config.logger.error(
            `Failed to register ${topic} webhook: ${JSON.stringify(
              result.data,
            )}`,
            {shop: session.shop},
          );
        }
      }
    }
  }
}

async function handleCallbackError(
  req: Request,
  res: Response,
  api: Shopify,
  config: AppConfigInterface,
  error: Error,
) {
  switch (true) {
    case error instanceof InvalidOAuthError:
      res.status(400);
      res.send(error.message);
      break;
    case error instanceof CookieNotFound:
      await redirectToAuth({req, res, api, config});
      break;
    default:
      res.status(500);
      res.send(error.message);
      break;
  }
}
