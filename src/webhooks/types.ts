import {Express, Request, Response} from 'express';
import {
  EventBridgeWebhookHandler,
  HttpWebhookHandler,
  PubSubWebhookHandler,
  Shopify,
} from '@shopify/shopify-api';

import {ApiAndConfigParams} from '../types';

type WebhookHandlerWithoutCallbackUrl =
  | Omit<HttpWebhookHandler, 'callbackUrl'>
  | EventBridgeWebhookHandler
  | PubSubWebhookHandler;

export interface WebhookHandlersParam {
  [topic: string]:
    | WebhookHandlerWithoutCallbackUrl
    | WebhookHandlerWithoutCallbackUrl[];
}

export interface AttachWebhooksParams extends ApiAndConfigParams {
  subApp: Express;
}

export interface WebhooksMountParams extends ApiAndConfigParams {
  handlers?: WebhookHandlersParam;
}

export interface WebhookProcessParams {
  req: Request;
  res: Response;
  api: Shopify;
}

export interface WebhooksConfigInterface {
  path: string;
}
