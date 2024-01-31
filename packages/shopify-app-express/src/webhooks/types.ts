import {Request, RequestHandler, Response} from 'express';
import {Shopify, WebhookHandler} from '@shopify/shopify-api';

import {AppConfigInterface} from '../config-types';

export type WebhookHandlersParam = Record<
  string,
  WebhookHandler | WebhookHandler[]
>;

export interface WebhookProcessParams {
  req: Request;
  res: Response;
  api: Shopify;
  config: AppConfigInterface;
}

export interface ProcessWebhooksMiddlewareParams {
  webhookHandlers: WebhookHandlersParam;
}

export type ProcessWebhooksMiddleware = (
  params: ProcessWebhooksMiddlewareParams,
) => RequestHandler[];
