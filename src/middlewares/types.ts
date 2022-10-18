import {RequestHandler} from 'express';

export type AuthenticatedRequestMiddleware = () => RequestHandler;
export type EnsureInstalledMiddleware = () => RequestHandler;
