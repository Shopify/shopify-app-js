import {HttpResponseError, Shopify, Session} from '@shopify/shopify-api';
import {Request, Response, NextFunction} from 'express';

import {redirectToAuth} from '../redirect-to-auth';
import {returnTopLevelRedirection} from '../return-top-level-redirection';
import {ApiAndConfigParams} from '../types';

const TEST_GRAPHQL_QUERY = `
{
  shop {
    name
  }
}`;

export function createAuthenticatedRequest({api, config}: ApiAndConfigParams) {
  return function authenticatedRequest() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const session = await api.session.getCurrent({
        isOnline: config.useOnlineTokens,
        rawRequest: req,
        rawResponse: res,
      });

      let shop = req.query.shop;

      if (session && shop && session.shop !== shop) {
        // The current request is for a different shop. Redirect gracefully.
        return redirectToAuth({req, res, api, config});
      }

      if (session?.isActive(api.config.scopes)) {
        if (await isValidAccessToken(api, session)) {
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

      return returnTopLevelRedirection({
        res,
        bearerPresent: Boolean(bearerPresent),
        redirectUrl: `${config.auth.path}?shop=${shop}`,
      });
    };
  };
}

async function isValidAccessToken(
  api: Shopify,
  session: Session,
): Promise<boolean> {
  try {
    const client = new api.clients.Graphql({
      domain: session.shop,
      accessToken: session.accessToken,
    });
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
