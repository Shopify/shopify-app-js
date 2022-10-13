import {Request, Response} from 'express';
import {
  CallbackResponse,
  CookieNotFound,
  InvalidOAuthError,
  LogSeverity,
  Session,
  Shopify,
} from '@shopify/shopify-api';

import {AppConfigInterface} from '../types';
import {redirectToHost} from '../redirect-to-host';

import {AfterAuthCallback, CreateAuthCallbackParams} from './types';
import {createAuthBegin} from './auth-begin';

export function createAuthCallback({
  api,
  config,
  afterAuth,
}: CreateAuthCallbackParams) {
  return async function authCallback(req: Request, res: Response) {
    try {
      const callbackResponse = await api.auth.callback({
        isOnline: config.useOnlineTokens,
        rawRequest: req,
        rawResponse: res,
      });

      await afterAuthActions(req, res, api, callbackResponse, afterAuth);
    } catch (error) {
      await handleCallbackError(req, res, api, config, error);
    }
  };
}

async function afterAuthActions(
  req: Request,
  res: Response,
  api: Shopify,
  callbackResponse: CallbackResponse,
  afterAuth?: AfterAuthCallback,
) {
  await registerWebhooks(req, res, callbackResponse.session);

  if (afterAuth) {
    await afterAuth({
      req,
      res,
      session: callbackResponse.session,
    });
  }

  // We redirect to the host-based app URL ONLY if the afterAuth callback didn't send a response already
  if (!res.headersSent) {
    await redirectToHost(req, res, api, callbackResponse.session);
  }
}

async function registerWebhooks(
  _req: Request,
  _res: Response,
  _session: Session,
) {
  // eslint-disable-next-line no-warning-comments
  // TODO Add webhook support to configs
  // const responses = await api.webhooks.registerAllHttp({
  //   path: config.webhookPath,
  //   shop: _session.shop,
  //   accessToken: _session.accessToken!,
  // });
  //
  // Object.entries(responses).map(([topic, response]) => {
  //   if (!response.success && !gdprTopics.includes(topic)) {
  //     if (response.result.errors) {
  //       console.log(
  //         `Failed to register ${topic} webhook: ${response.result.errors[0].message}`,
  //       );
  //     } else {
  //       console.log(
  //         `Failed to register ${topic} webhook: ${JSON.stringify(
  //           response.result.data,
  //           undefined,
  //           2,
  //         )}`,
  //       );
  //     }
  //   }
  // });
}

async function handleCallbackError(
  req: Request,
  res: Response,
  api: Shopify,
  config: AppConfigInterface,
  error: Error,
) {
  api.config.logFunction(
    LogSeverity.Warning,
    `Failed to complete OAuth with error: ${error}`,
  );

  switch (true) {
    case error instanceof InvalidOAuthError:
      res.status(400);
      res.send(error.message);
      break;
    case error instanceof CookieNotFound:
      await createAuthBegin({api, config})(req, res);
      break;
    default:
      res.status(500);
      res.send(error.message);
      break;
  }
}
