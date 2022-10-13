import {Request, Response} from 'express';

import {redirectToAuth} from '../redirect-to-auth';

import {CreateAuthBeginParams} from './types';

export function createAuthBegin({api, config}: CreateAuthBeginParams) {
  return async function authBegin(req: Request, res: Response): Promise<void> {
    await redirectToAuth(req, res, api, config);
  };
}
