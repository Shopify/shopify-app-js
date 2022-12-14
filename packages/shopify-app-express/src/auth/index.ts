import {NextFunction, Request, RequestHandler, Response} from 'express';

import {ApiAndConfigParams} from '../types';
import {redirectToAuth} from '../redirect-to-auth';

import {authCallback} from './auth-callback';
import {AuthMiddleware} from './types';

export function auth({api, config}: ApiAndConfigParams): AuthMiddleware {
  return {
    begin(): RequestHandler {
      return async (req: Request, res: Response) =>
        redirectToAuth({req, res, api, config});
    },
    callback(): RequestHandler {
      return async (req: Request, res: Response, next: NextFunction) => {
        await config.logger.info('Handling request to complete OAuth process');

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
