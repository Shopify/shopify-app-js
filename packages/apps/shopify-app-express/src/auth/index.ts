import {NextFunction, Request, RequestHandler, Response} from 'express';

import {ApiAndConfigParams} from '../types';
import {redirectToAuth} from '../redirect-to-auth';

import {authCallback} from './auth-callback';
import {AuthMiddleware} from './types';

export function auth({api, config}: ApiAndConfigParams): AuthMiddleware {
  const usesTokenExchange = () =>
    Boolean(config.future?.unstable_tokenExchange && api.config.isEmbeddedApp);

  return {
    begin(): RequestHandler {
      return async (req: Request, res: Response) => {
        if (usesTokenExchange()) {
          config.logger.error(
            'auth.begin() was called while token exchange is enabled. Embedded apps using token exchange do not use the OAuth code flow routes.',
          );
          res
            .status(400)
            .send(
              'This app uses token exchange (unstable_tokenExchange). The OAuth auth routes are not used in this mode.',
            );
          return;
        }

        return redirectToAuth({req, res, api, config});
      };
    },
    callback(): RequestHandler {
      return async (req: Request, res: Response, next: NextFunction) => {
        if (usesTokenExchange()) {
          config.logger.error(
            'auth.callback() was called while token exchange is enabled. Embedded apps using token exchange do not use the OAuth code flow routes.',
          );
          res
            .status(400)
            .send(
              'This app uses token exchange (unstable_tokenExchange). The OAuth auth routes are not used in this mode.',
            );
          return;
        }

        config.logger.info('Handling request to complete OAuth process');

        const oauthCompleted = await authCallback({
          req,
          res,
          api,
          config,
        });

        if (oauthCompleted) {
          next();
        }
      };
    },
  };
}
