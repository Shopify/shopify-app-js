import {Request, Response} from 'express';

import {AttachAuthParams} from './types';
import {authBegin} from './auth-begin';
import {authCallback} from './auth-callback';

export function attachAuth({
  api,
  config,
  subApp,
  afterAuth,
}: AttachAuthParams): void {
  subApp.get(config.auth.path, async (req: Request, res: Response) => {
    return authBegin({req, res, api, config});
  });

  subApp.get(config.auth.callbackPath, async (req: Request, res: Response) => {
    return authCallback({
      req,
      res,
      api,
      config,
      afterAuth,
    });
  });
}
