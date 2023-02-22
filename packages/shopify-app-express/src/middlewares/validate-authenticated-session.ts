import {Session, Shopify, InvalidJwtError} from '@shopify/shopify-api';
import {Request, Response, NextFunction} from 'express';

import {redirectToAuth} from '../redirect-to-auth';
import {returnTopLevelRedirection} from '../return-top-level-redirection';
import {ApiAndConfigParams} from '../types';

import {ValidateAuthenticatedSessionMiddleware} from './types';
import {hasValidAccessToken} from './has-valid-access-token';

interface validateAuthenticatedSessionParams extends ApiAndConfigParams {}

export function validateAuthenticatedSession({
  api,
  config,
}: validateAuthenticatedSessionParams): ValidateAuthenticatedSessionMiddleware {
  return function validateAuthenticatedSession() {
    return async (req: Request, res: Response, next: NextFunction) => {
      config.logger.info('Running validateAuthenticatedSession');

      let sessionId: string | undefined;
      try {
        sessionId = await api.session.getCurrentId({
          isOnline: config.useOnlineTokens,
          rawRequest: req,
          rawResponse: res,
        });
      } catch (error) {
        await config.logger.error(
          `Error when loading session from storage: ${error}`,
        );

        await handleSessionError(req, res, error);
        return undefined;
      }

      let session: Session | undefined;
      if (sessionId) {
        try {
          session = await config.sessionStorage.loadSession(sessionId);
        } catch (error) {
          await config.logger.error(
            `Error when loading session from storage: ${error}`,
          );

          res.status(500);
          res.send(error.message);
          return undefined;
        }
      }

      let shop =
        api.utils.sanitizeShop(req.query.shop as string) || session?.shop;

      if (session && shop && session.shop !== shop) {
        config.logger.debug(
          'Found a session for a different shop in the request',
          {currentShop: session.shop, requestShop: shop},
        );

        return redirectToAuth({req, res, api, config});
      }

      if (session) {
        config.logger.debug('Request session found and loaded', {
          shop: session.shop,
        });

        if (session.isActive(api.config.scopes)) {
          config.logger.debug('Request session exists and is active', {
            shop: session.shop,
          });

          if (await hasValidAccessToken(api, session)) {
            config.logger.info('Request session has a valid access token', {
              shop: session.shop,
            });

            res.locals.shopify = {
              ...res.locals.shopify,
              session,
            };
            return next();
          }
        }
      }

      const bearerPresent = req.headers.authorization?.match(/Bearer (.*)/);
      if (bearerPresent) {
        if (!shop) {
          shop = await setShopFromSessionOrToken(
            api,
            session,
            bearerPresent[1],
          );
        }
      }

      const redirectUrl = `${config.auth.path}?shop=${shop}`;
      config.logger.info(
        `Session was not valid. Redirecting to ${redirectUrl}`,
        {shop},
      );

      return returnTopLevelRedirection({
        res,
        config,
        bearerPresent: Boolean(bearerPresent),
        redirectUrl,
      });
    };
  };
}

async function handleSessionError(_req: Request, res: Response, error: Error) {
  switch (true) {
    case error instanceof InvalidJwtError:
      res.status(401);
      res.send(error.message);
      break;
    default:
      res.status(500);
      res.send(error.message);
      break;
  }
}

async function setShopFromSessionOrToken(
  api: Shopify,
  session: Session | undefined,
  token: string,
): Promise<string | undefined> {
  let shop: string | undefined;

  if (session) {
    shop = session.shop;
  } else if (api.config.isEmbeddedApp) {
    const payload = await api.session.decodeSessionToken(token);
    shop = payload.dest.replace('https://', '');
  }
  return shop;
}
