import express, {Express, Request, Response} from 'express';

import {CreateAuthAppParams} from './types';
import {createAuthBegin} from './auth-begin';
import {createAuthCallback} from './auth-callback';

export function createAuthApp({api, config}: CreateAuthAppParams): Express {
  const authApp = express();

  authApp.on('mount', () => {
    const mountPath = authApp.mountpath as string;

    config.auth.path = `${mountPath}${config.auth.path}`;
    config.auth.callbackPath = `${mountPath}${config.auth.callbackPath}`;
  });

  authApp.get(config.auth.path, async (req: Request, res: Response) => {
    return createAuthBegin({api, config})(req, res);
  });

  authApp.get(config.auth.callbackPath, async (req: Request, res: Response) => {
    return createAuthCallback({api, config})(req, res);
  });

  return authApp;
}
