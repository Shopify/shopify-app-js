import {Express, Request, Response} from 'express';
import {
  DeliveryMethod,
  Shopify,
  WebhookHandlerFunction,
} from '@shopify/shopify-api';

import {ApiAndConfigParams} from '../types';

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

export interface NonHttpWebhookHandler extends WebhookHandler {
  deliveryMethod: Exclude<DeliveryMethod, DeliveryMethod.Http>;
  address: string;
}

export type WebhookConfigHandler = HttpWebhookHandler | NonHttpWebhookHandler;

export interface WebhooksConfigInterface {
  path: string;
  handlers: WebhookConfigHandler[];
}

export interface CreateWebhookAppParams extends ApiAndConfigParams {
  specialWebhookHandlers?: WebhookConfigHandler[];
}
