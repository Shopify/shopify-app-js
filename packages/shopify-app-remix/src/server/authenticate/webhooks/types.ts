import {Session, Shopify, ShopifyRestResources} from '@shopify/shopify-api';

import type {JSONValue} from '../../types';

export interface RegisterWebhooksOptions {
  /**
   * The Shopify session used to register webhooks via the Admin API.
   */
  session: Session;
}

interface Context<Topics = string | number | symbol> {
  apiVersion: string;
  shop: string;
  topic: Topics;
  webhookId: string;
  payload: JSONValue;
}

export interface WebhookContext<Topics = string | number | symbol>
  extends Context<Topics> {
  session: undefined;
  admin: undefined;
}

export interface WebhookContextWithSession<
  Topics = string | number | symbol,
  Resources extends ShopifyRestResources = any,
> extends Context<Topics> {
  session: Session;
  admin: {
    rest: InstanceType<Shopify['clients']['Rest']> & Resources;
    graphql: InstanceType<Shopify['clients']['Graphql']>;
  };
}
