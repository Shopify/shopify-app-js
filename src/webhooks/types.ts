import {Express, Request, Response} from 'express';
import {
  DeliveryMethod,
  Shopify,
  WebhookHandlerFunction,
} from '@shopify/shopify-api';

import {AppConfigInterface} from '../types';

export interface CreateWebhookAppParams {
  api: Shopify;
  config: AppConfigInterface;
}

interface WebhookHandler {
  topic: string;
}

export interface HttpWebhookHandler extends WebhookHandler {
  deliveryMethod: DeliveryMethod.Http;
  handler: WebhookHandlerFunction;
}

export interface WebhooksMiddlewareParams {
  handlers?: (HttpWebhookHandler | NonHttpWebhookHandler)[];
}

export type WebhooksMiddleware = (
  webhookParams?: WebhooksMiddlewareParams,
) => Express;

export interface WebhookProcessParams {
  req: Request;
  res: Response;
  api: Shopify;
}

export interface AddWebhookHandlersParams {
  api: Shopify;
  config: AppConfigInterface;
}

export interface NonHttpWebhookHandler extends WebhookHandler {
  deliveryMethod: Exclude<DeliveryMethod, DeliveryMethod.Http>;
  address: string;
}

export type WebhookConfigHandler = HttpWebhookHandler | NonHttpWebhookHandler;

export interface WebhooksConfigInterface {
  path: string;
  handlers: WebhookConfigHandler[];
}
