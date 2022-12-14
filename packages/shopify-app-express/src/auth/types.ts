import {Request, RequestHandler, Response} from 'express';

import {ApiAndConfigParams} from '../types';

export interface AuthMiddleware {
  begin: () => RequestHandler;
  callback: () => RequestHandler;
}

export interface AuthCallbackParams extends ApiAndConfigParams {
  req: Request;
  res: Response;
}
