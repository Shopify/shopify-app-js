import {Request, Response} from 'express';
import {
  CookieNotFound,
  gdprTopics,
  InvalidOAuthError,
  Session,
  Shopify,
} from '@shopify/shopify-api';

import {AppConfigInterface, AfterAuthCallback} from '../config-types';
import {redirectToHost} from '../redirect-to-host';

import {AuthCallbackParams} from './types';
import {authBegin} from './auth-begin';

export async function authCallback({
  req,
  res,
  api,
  config,
  afterAuth,
}: AuthCallbackParams) {
  try {
    const callbackResponse = await api.auth.callback({
      isOnline: config.useOnlineTokens,
      rawRequest: req,
      rawResponse: res,
    });

    await config.logger.debug('Callback is valid, storing session', {
      shop: callbackResponse.session.shop,
    });

    config.sessionStorage.storeSession(callbackResponse.session);

    await config.logger.debug('Completed OAuth callback', {
      shop: callbackResponse.session.shop,
    });

    await afterAuthActions(
      req,
      res,
      config,
      api,
      callbackResponse.session,
      afterAuth,
    );
  } catch (error) {
    await config.logger.error(`Failed to complete OAuth with error: ${error}`);

    await handleCallbackError(req, res, api, config, error);
  }
}

async function afterAuthActions(
  req: Request,
  res: Response,
  config: AppConfigInterface,
  api: Shopify,
  session: Session,
  afterAuth?: AfterAuthCallback,
) {
  await registerWebhooks(config, api, session);

  if (afterAuth) {
    await config.logger.debug('Calling afterAuth callback', {
      shop: session.shop,
    });

    await afterAuth({
      req,
      res,
      session,
    });
  }

  // We redirect to the host-based app URL ONLY if the afterAuth callback didn't send a response already
  if (!res.headersSent) {
    await redirectToHost({req, res, api, config, session});
  }
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
      await authBegin({req, res, api, config});
      break;
    default:
      res.status(500);
      res.send(error.message);
      break;
  }
}
