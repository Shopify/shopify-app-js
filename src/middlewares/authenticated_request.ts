import {HttpResponseError, Shopify} from '@shopify/shopify-api';
import {Request, Response, NextFunction} from 'express';

import {redirectToAuth} from '../redirect-to-auth';
import {AppConfigInterface} from '../types';

interface CreateAuthenticatedRequestParams {
  api: Shopify;
  config: AppConfigInterface;
}

const TEST_GRAPHQL_QUERY = `
{
  shop {
    name
  }
}`;

export function createAuthenticatedRequest({
  api,
  config,
}: CreateAuthenticatedRequestParams) {
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
        try {
          // Make a request to ensure the access token is still valid. Otherwise, re-authenticate the user.
          const client = new api.clients.Graphql({
            domain: session.shop,
            accessToken: session.accessToken,
          });
          await client.query({data: TEST_GRAPHQL_QUERY});

          res.locals.shopify = {
            ...res.locals.shopify,
            session,
          };

          return next();
        } catch (error) {
          if (
            error instanceof HttpResponseError &&
            error.response.code === 401
          ) {
            // Re-authenticate if we get a 401 response
          } else {
            throw error;
          }
        }
      }

      const bearerPresent = req.headers.authorization?.match(/Bearer (.*)/);
      if (bearerPresent) {
        if (!shop) {
          if (session) {
            shop = session.shop;
          } else if (api.config.isEmbeddedApp) {
            if (bearerPresent) {
              const payload = await api.session.decodeSessionToken(
                bearerPresent[1],
              );
              shop = payload.dest.replace('https://', '');
            }
          }
        }
      }

      return returnTopLevelRedirection(
        res,
        Boolean(bearerPresent),
        `${config.auth.path}?shop=${shop}`,
      );
    };
  };
}

function returnTopLevelRedirection(
  res: Response,
  bearerPresent: boolean,
  redirectUrl: string,
) {
  // If the request has a bearer token, the app is currently embedded, and must break out of the iframe to
  // re-authenticate
  if (bearerPresent) {
    res.status(403);
    res.header('X-Shopify-API-Request-Failure-Reauthorize', '1');
    res.header('X-Shopify-API-Request-Failure-Reauthorize-Url', redirectUrl);
    res.end();
  } else {
    res.redirect(redirectUrl);
  }
}
