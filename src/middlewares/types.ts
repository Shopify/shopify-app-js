import {RequestHandler} from 'express';

export type validateSessionMiddleware = () => RequestHandler;
export type EnsureInstalledMiddleware = () => RequestHandler;
export type CspHeadersMiddleware = () => RequestHandler;
