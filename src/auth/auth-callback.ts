import {Request, Response} from 'express';
import {
  CallbackResponse,
  CookieNotFound,
  gdprTopics,
  InvalidOAuthError,
  LogSeverity,
  Session,
  Shopify,
} from '@shopify/shopify-api';

import {AppConfigInterface} from '../types';
import {NonHttpWebhookHandler} from '../webhooks/types';
import {redirectToHost} from '../redirect-to-host';

import {AfterAuthCallback, AuthCallbackParams} from './types';
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

    await afterAuthActions(req, res, api, config, callbackResponse, afterAuth);
  } catch (error) {
    await handleCallbackError(req, res, api, config, error);
  }
}

async function afterAuthActions(
  req: Request,
  res: Response,
  api: Shopify,
  config: AppConfigInterface,
  callbackResponse: CallbackResponse,
  afterAuth?: AfterAuthCallback,
) {
  await registerWebhooks(api, config, callbackResponse.session);

  if (afterAuth) {
    await afterAuth({
      req,
      res,
      session: callbackResponse.session,
    });
  }

  // We redirect to the host-based app URL ONLY if the afterAuth callback didn't send a response already
  if (!res.headersSent) {
    await redirectToHost({req, res, api, session: callbackResponse.session});
  }
}

async function registerWebhooks(
  api: Shopify,
  config: AppConfigInterface,
  session: Session,
) {
  for (const entry of config.webhooks.handlers) {
    const response = await api.webhooks.register({
      shop: session.shop,
      accessToken: session.accessToken!,
      path: (entry as NonHttpWebhookHandler).address ?? config.webhooks.path,
      topic: entry.topic,
      deliveryMethod: entry.deliveryMethod,
    });
    console.log(response[entry.topic].result);

    if (!response[entry.topic].success && !gdprTopics.includes(entry.topic)) {
      const result: any = response[entry.topic].result;

      if (result.errors) {
        await api.config.logFunction(
          LogSeverity.Error,
          `Failed to register ${entry.topic} webhook: ${result.errors[0].message}`,
        );
      } else {
        await api.config.logFunction(
          LogSeverity.Error,
          `Failed to register ${entry.topic} webhook: ${JSON.stringify(
            result.data,
            undefined,
            2,
          )}`,
        );
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
  await api.config.logFunction(
    LogSeverity.Warning,
    `Failed to complete OAuth with error: ${error}`,
  );

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
