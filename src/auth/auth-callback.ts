import {Request, Response} from 'express';
import {
  CallbackResponse,
  CookieNotFound,
  InvalidOAuthError,
  LogSeverity,
  Shopify,
} from '@shopify/shopify-api';

import {AppConfigInterface} from '../types';

import {CreateAuthCallbackParams} from './types';
import {createAuthBegin} from './auth-begin';

// eslint-disable-next-line no-process-env
const IS_TEST = process.env.NODE_ENV !== 'production';

export function createAuthCallback({api, config}: CreateAuthCallbackParams) {
  return async function authCallback(req: Request, res: Response) {
    try {
      const callback = await api.auth.callback({
        isOnline: config.useOnlineTokens,
        rawRequest: req,
        rawResponse: res,
      });

      await afterAuthActions(req, res, api, config, callback);
    } catch (error) {
      await handleCallbackError(req, res, api, config, error);
    }
  };
}

async function afterAuthActions(
  req: Request,
  res: Response,
  api: Shopify,
  config: AppConfigInterface,
  callback: CallbackResponse,
) {
  await registerWebhooks(req, res, callback);

  const hasPayment = await checkForPayment(api, config, callback);

  if (config.auth.afterAuth) {
    await config.auth.afterAuth({
      req,
      res,
      session: callback.session,
      hasPayment,
      api,
    });
  }

  // If the callback triggers a response, we leave it alone
  if (!res.headersSent) {
    await redirectToHost(req, res, api, callback);
  }
}

async function registerWebhooks(
  _req: Request,
  _res: Response,
  _callback: CallbackResponse,
) {
  // eslint-disable-next-line no-warning-comments
  // TODO Add webhook support to configs
  // const responses = await api.webhooks.registerAllHttp({
  //   path: config.webhookPath,
  //   shop: _callback.session.shop,
  //   accessToken: _callback.session.accessToken!,
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

async function checkForPayment(
  api: Shopify,
  config: AppConfigInterface,
  callback: CallbackResponse,
): Promise<boolean> {
  if (!api.config.billing || !config.auth.checkBillingPlans) {
    return true;
  }

  return api.billing.check({
    session: callback.session,
    isTest: IS_TEST,
    plans: config.auth.checkBillingPlans,
  });
}

async function redirectToHost(
  req: Request,
  res: Response,
  api: Shopify,
  callback: CallbackResponse,
) {
  const host = api.utils.sanitizeHost(req.query.host as string)!;
  const redirectUrl = api.config.isEmbeddedApp
    ? await api.auth.getEmbeddedAppUrl({
        rawRequest: req,
        rawResponse: res,
      })
    : `/?shop=${callback.session.shop}&host=${encodeURIComponent(host)}`;

  res.redirect(redirectUrl);
}

async function handleCallbackError(
  req: Request,
  res: Response,
  api: Shopify,
  config: AppConfigInterface,
  error: Error,
) {
  console.warn(error);

  if (api.config.logFunction) {
    api.config.logFunction(
      LogSeverity.Warning,
      `Failed to complete OAuth with error: ${error}`,
    );
  }

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
