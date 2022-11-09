import {HttpResponseError, Shopify, Session} from '@shopify/shopify-api';
import {Request, Response, NextFunction} from 'express';

import {redirectToAuth} from '../redirect-to-auth';
import {returnTopLevelRedirection} from '../return-top-level-redirection';
import {ApiAndConfigParams} from '../types';

import {AuthenticatedRequestMiddleware} from './types';

interface CreateAuthenticatedRequestParams extends ApiAndConfigParams {}

export function createAuthenticatedRequest({
  api,
  config,
}: CreateAuthenticatedRequestParams): AuthenticatedRequestMiddleware {
  return function authenticatedRequest() {
    return async (req: Request, res: Response, next: NextFunction) => {
      config.logger.info('Running authenticatedRequest');

      const sessionId = await api.session.getCurrentId({
        isOnline: config.useOnlineTokens,
        rawRequest: req,
        rawResponse: res,
      });

      const session = await config.sessionStorage.loadSession(
        sessionId as string,
      );

      let shop = req.query.shop;

      if (session && shop && session.shop !== shop) {
        // The current request is for a different shop. Redirect gracefully.
        return redirectToAuth({req, res, api, config});
      }

      config.logger.debug('Request session found and loaded', {
        shop: session?.shop,
      });

      if (session?.isActive(api.config.scopes)) {
        config.logger.debug('Request session exists and is active', {
          shop: session.shop,
        });

        if (await isValidAccessToken(api, session)) {
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
      config.logger.debug(
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

const TEST_GRAPHQL_QUERY = `
{
  shop {
    name
  }
}`;

async function isValidAccessToken(
  api: Shopify,
  session: Session,
): Promise<boolean> {
  try {
    const client = new api.clients.Graphql({session});
    await client.query({data: TEST_GRAPHQL_QUERY});
    return true;
  } catch (error) {
    if (error instanceof HttpResponseError && error.response.code === 401) {
      // Re-authenticate if we get a 401 response
      return false;
    } else {
      throw error;
    }
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
