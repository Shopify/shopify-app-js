import {Request, Response} from 'express';
import {
  BotActivityDetected,
  CookieNotFound,
  InvalidOAuthError,
  Shopify,
} from '@shopify/shopify-api';

import {AppConfigInterface} from '../config-types';
import {redirectToAuth} from '../redirect-to-auth';
import {registerWebhooks} from '../helpers/register-webhooks';

import {AuthCallbackParams} from './types';

export async function authCallback({
  req,
  res,
  api,
  config,
}: AuthCallbackParams): Promise<boolean> {
  try {
    const callbackResponse = await api.auth.callback({
      rawRequest: req,
      rawResponse: res,
      expiring: config.future?.expiringOfflineAccessTokens,
    });

    config.logger.debug('Callback is valid, storing session', {
      shop: callbackResponse.session.shop,
      isOnline: callbackResponse.session.isOnline,
    });

    await config.sessionStorage.storeSession(callbackResponse.session);

    // If this is an offline OAuth process, register webhooks
    if (!callbackResponse.session.isOnline) {
      await registerWebhooks(config, api, callbackResponse.session);
    }

    // If we're completing an offline OAuth process, immediately kick off the online one
    if (config.useOnlineTokens && !callbackResponse.session.isOnline) {
      config.logger.debug(
        'Completing offline token OAuth, redirecting to online token OAuth',
        {shop: callbackResponse.session.shop},
      );

      await redirectToAuth({req, res, api, config, isOnline: true});
      return false;
    }

    res.locals.shopify = {
      ...res.locals.shopify,
      session: callbackResponse.session,
    };

    await config.hooks?.afterAuth?.({session: callbackResponse.session});

    config.logger.debug('Completed OAuth callback', {
      shop: callbackResponse.session.shop,
      isOnline: callbackResponse.session.isOnline,
    });

    return true;
  } catch (error) {
    config.logger.error(`Failed to complete OAuth with error: ${error}`);

    await handleCallbackError(req, res, api, config, error);
  }

  return false;
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
    case error instanceof BotActivityDetected:
      res.status(410);
      res.send(error.message);
      break;
    default:
      res.status(500);
      res.send(error.message);
      break;
  }
}
